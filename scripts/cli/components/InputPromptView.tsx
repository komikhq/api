import React from "react";
import { Text as InkText, Box as InkBox } from "ink";
import TextInput from "ink-text-input";

const Box = InkBox as any;
const Text = InkText as any;
const InkTextInput = TextInput as any;

export function InputPromptView({
  label,
  value,
  onChange,
  onSubmit,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Box flexDirection="column">
      <Text bold color="yellow">
        {label}
      </Text>
      <InkTextInput value={value} onChange={onChange} onSubmit={onSubmit} />
    </Box>
  );
}
