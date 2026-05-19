/**
 * OTP Input — 6-digit code entry with auto-focus and auto-submit.
 * Replicates the Customer App's OTP UX exactly.
 */
import React, { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';

interface OTPInputProps {
  value: string[];
  onChange: (otp: string[]) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  length?: number;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
  length = 6,
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return; // digits only

    const newOtp = [...value];
    newOtp[index] = text;
    onChange(newOtp);

    // Auto-focus next
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every(d => d !== '') && text) {
      onComplete?.(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {value.map((digit, index) => (
        <TextInput
          key={index}
          ref={ref => {
            inputRefs.current[index] = ref;
          }}
          style={[styles.input, digit && styles.inputFilled]}
          value={digit}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          editable={!disabled}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 60,
    maxWidth: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(45, 212, 191, 0.3)',
    fontFamily: fonts.primary,
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.bold as any,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  inputFilled: {
    borderColor: colors.accentTeal,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
  },
});
