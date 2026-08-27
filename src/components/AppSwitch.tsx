import { Switch, SwitchProps } from 'react-native';

import { colors } from '../theme/tokens';

export function AppSwitch(props: SwitchProps) {
  return (
    <Switch
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor={colors.white}
      {...props}
    />
  );
}
