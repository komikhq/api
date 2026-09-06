import React from "react";
import { Text as InkText, Box as InkBox } from "ink";
import SelectInput from "ink-select-input";
import type { UserItem } from "../service.js";

const Box = InkBox as any;
const Text = InkText as any;
const InkSelectInput = SelectInput as any;

export function UserListView({
  userList,
  onSelectUser,
}: {
  userList: UserItem[];
  onSelectUser: (item: { value: string; label: string }) => void;
}) {
  const selectItems = [
    { label: "🔍 [Cari / Filter Pengguna...]", value: "__SEARCH__" },
    ...userList.map((u) => ({
      label: `❯ [${u.role.toUpperCase()}] ${u.name} <${u.email}> ${u.emailVerified ? "✓ Verified" : "✗ Unverified"}`,
      value: u.id,
    })),
  ];

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} flexDirection="column">
        <Text bold color="green">
          Daftar Pengguna Platform ({userList.length} User Ditemukan):
        </Text>
      </Box>

      {/* Render structured table preview */}
      <Box borderStyle="single" borderColor="gray" flexDirection="column" paddingX={1} marginBottom={1}>
        <Box justifyContent="space-between" borderStyle="single" borderBottom borderTop={false} borderLeft={false} borderRight={false}>
          <Text bold color="cyan">Nama Pengguna</Text>
          <Text bold color="cyan">Alamat Email</Text>
          <Text bold color="cyan">Role</Text>
          <Text bold color="cyan">Status</Text>
        </Box>
        {userList.length === 0 ? (
          <Text color="gray">Tidak ada data pengguna.</Text>
        ) : (
          userList.slice(0, 8).map((u) => (
            <Box key={u.id} justifyContent="space-between">
              <Text color="white">{u.name.length > 20 ? u.name.slice(0, 18) + ".." : u.name.padEnd(20)}</Text>
              <Text color="gray">{u.email.length > 25 ? u.email.slice(0, 23) + ".." : u.email.padEnd(25)}</Text>
              <Text color={u.role === "admin" ? "yellow" : "white"}>[{u.role.toUpperCase()}]</Text>
              <Text color={u.emailVerified ? "green" : "red"}>{u.emailVerified ? "✓ Verified" : "✗ Pending"}</Text>
            </Box>
          ))
        )}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text bold color="yellow">Navigasi Pilihan (Gunakan Panah Keyboard ↑ ↓):</Text>
        <InkSelectInput items={selectItems} onSelect={onSelectUser} />
      </Box>
    </Box>
  );
}
