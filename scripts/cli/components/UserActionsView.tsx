import React from "react";
import { Text as InkText, Box as InkBox } from "ink";
import SelectInput from "ink-select-input";
import type { UserItem } from "../service.js";

const Box = InkBox as any;
const Text = InkText as any;
const InkSelectInput = SelectInput as any;

export function UserActionsView({
  user,
  onSelectAction,
}: {
  user: UserItem;
  onSelectAction: (item: { value: string; label: string }) => void;
}) {
  const items = [
    { label: "✏️ Ubah Nama", value: "EDIT_NAME" },
    { label: "📧 Ubah Email", value: "EDIT_EMAIL" },
    { label: `🛡️ Ubah Role (ke ${user.role === "admin" ? "USER" : "ADMIN"})`, value: "TOGGLE_ROLE" },
    { label: "❌ Hapus Pengguna Ini", value: "DELETE" },
    { label: "⬅️ Kembali ke Daftar", value: "BACK" },
  ];

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor="blue" paddingX={1} flexDirection="column">
        <Text bold color="blue">
          User: {user.name} ({user.email})
        </Text>
        <Text>ID: {user.id}</Text>
        <Text>Role Saat Ini: {user.role.toUpperCase()}</Text>
      </Box>
      <Box marginTop={1}>
        <InkSelectInput items={items} onSelect={onSelectAction} />
      </Box>
    </Box>
  );
}
