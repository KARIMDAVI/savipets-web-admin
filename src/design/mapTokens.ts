import rawTokens from '../../../shared/design-tokens/mapTokens.json';

type RawMapTokens = {
  colors: {
    primary: string;
    secondary: string;
    warning: string;
    danger: string;
    routeActive: string;
    routeInactive: string;
    popupBackground: string;
    popupText: string;
  };
  sizes: {
    markerDiameter: number;
    markerBorder: number;
    mapPadding: number;
  };
};

const tokens = rawTokens as RawMapTokens;

export const mapTokens = {
  colors: tokens.colors,
  sizes: tokens.sizes,
} as const;

export type MapTokens = typeof mapTokens;





