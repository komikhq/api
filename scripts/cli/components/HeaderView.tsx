import React from "react";
import { Text as InkText, Box as InkBox } from "ink";

const Box = InkBox as any;
const Text = InkText as any;

export function HeaderView() {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold color="cyan">
        KomikHQ Admin CLI - Interactive User Manager
      </Text>
      <Text color="gray">Tekan ESC / Ctrl+C untuk keluar.</Text>
    </Box>
  );
}

export function StatusView({ message }: { message: string }) {
  if (!message) return null;
  return (
    <Box marginBottom={1} paddingX={1} borderStyle="single" borderColor="yellow">
      <Text color="yellow">{message}</Text>
    </Box>
  );
}
