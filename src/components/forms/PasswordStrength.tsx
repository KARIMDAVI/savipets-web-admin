/**
 * Password Strength Indicator
 * Shows password strength with breach checking
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Progress, Typography, Alert } from 'antd';
import { colors } from '@/design/tokens';
import { securityConfig } from '@/config/security.config';

const { Text } = Typography;

interface PasswordStrengthProps {
  password: string;
  checkBreaches?: boolean;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  checkBreaches = securityConfig.password.checkBreaches,
}) => {
  const [isBreached, setIsBreached] = useState(false);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);

  const strength = useMemo(() => {
    if (!password) return 0;

    let score = 0;
    const checks = {
      length8: password.length >= 8,
      length12: password.length >= 12,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^a-zA-Z0-9]/.test(password),
      noCommonPatterns: !/(123|abc|qwerty|password|admin)/i.test(password),
    };

    if (checks.length8) score++;
    if (checks.length12) score++;
    if (checks.hasLower) score++;
    if (checks.hasUpper) score++;
    if (checks.hasNumber) score++;
    if (checks.hasSpecial) score++;
    if (checks.noCommonPatterns) score++;

    return Math.min(score, 5);
  }, [password]);

  // Check password breaches using k-anonymity
  useEffect(() => {
    if (!checkBreaches || !password || password.length < 8) {
      setIsBreached(false);
      return;
    }

    const checkBreach = async () => {
      setIsCheckingBreach(true);
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        const prefix = hashHex.substring(0, 5);
        const suffix = hashHex.substring(5);

        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        const text = await response.text();
        const hashes = text.split('\n').map(line => line.split(':')[0].toLowerCase());

        setIsBreached(hashes.includes(suffix));
      } catch (error) {
        console.error('Error checking password breach:', error);
      } finally {
        setIsCheckingBreach(false);
      }
    };

    const timeoutId = setTimeout(checkBreach, 500);
    return () => clearTimeout(timeoutId);
  }, [password, checkBreaches]);

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = [
    colors.error[500],
    colors.error[400],
    colors.warning[500],
    colors.info[500],
    colors.success[500],
    colors.success[600],
  ];

  if (!password) return null;

  return (
    <div>
      <Progress
        percent={(strength / 5) * 100}
        strokeColor={strengthColors[strength]}
        showInfo={false}
        status={isBreached ? 'exception' : 'active'}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Password strength: {strengthLabels[strength]}
          {isCheckingBreach && ' (checking...)'}
        </Text>
      </div>
      {isBreached && (
        <Alert
          message="This password has been found in data breaches"
          type="error"
          showIcon
          style={{ marginTop: 8, fontSize: '12px' }}
        />
      )}
    </div>
  );
};

