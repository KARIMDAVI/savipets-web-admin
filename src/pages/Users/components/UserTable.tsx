import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '@/types';

interface UserTableProps {
  columns: ColumnsType<User>;
  data: User[];
  loading: boolean;
}

const UserTable: React.FC<UserTableProps> = ({ columns, data, loading }) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 20,
        showSizeChanger: !isMobile, // Hide size changer on mobile
        showQuickJumper: !isMobile, // Hide quick jumper on mobile
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
        responsive: true,
        simple: isMobile, // Simplified pagination on mobile
      }}
      scroll={{ x: 'max-content' }} // Better mobile support with max-content
      size={isMobile ? 'small' : 'middle'} // Smaller table on mobile
    />
  );
};

export default UserTable;
