import React, { useState, useEffect } from "react";
import { render, Box as InkBox, useInput, useApp } from "ink";
import { createUsersCliService, type UserItem } from "./service.js";
import { HeaderView, StatusView } from "./components/HeaderView.js";
import { UserListView } from "./components/UserListView.js";
import { UserActionsView } from "./components/UserActionsView.js";
import { InputPromptView } from "./components/InputPromptView.js";

const Box = InkBox as any;

export function UsersCliApp() {
  const { exit } = useApp();
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [mode, setMode] = useState<"LIST" | "ACTIONS" | "EDIT_NAME" | "EDIT_EMAIL" | "SEARCH">("LIST");
  const [statusMsg, setStatusMsg] = useState("");
  const [inputValue, setInputValue] = useState("");

  const cliService = createUsersCliService();

  const fetchUsers = async () => {
    try {
      const data = await cliService.fetchUsers(searchQuery);
      setUserList(data);
    } catch (err: any) {
      setStatusMsg(`[ERROR DB] ${err.message || "Failed to query database"}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === "c")) {
      exit();
    }
  });

  const handleSelectUser = (item: { value: string; label: string }) => {
    if (item.value === "__SEARCH__") {
      setMode("SEARCH");
      return;
    }
    const target = userList.find((u) => u.id === item.value);
    if (target) {
      setSelectedUser(target);
      setMode("ACTIONS");
    }
  };

  const handleSelectAction = async (item: { value: string; label: string }) => {
    if (!selectedUser) return;

    if (item.value === "BACK") {
      setMode("LIST");
      return;
    }
    if (item.value === "EDIT_NAME") {
      setInputValue(selectedUser.name);
      setMode("EDIT_NAME");
      return;
    }
    if (item.value === "EDIT_EMAIL") {
      setInputValue(selectedUser.email);
      setMode("EDIT_EMAIL");
      return;
    }
    if (item.value === "TOGGLE_ROLE") {
      try {
        const newRole = await cliService.toggleRole(selectedUser.id, selectedUser.role);
        setStatusMsg(`[SUKSES] Role ${selectedUser.name} diubah menjadi: ${newRole.toUpperCase()}`);
        setMode("ACTIONS");
        fetchUsers();
      } catch (err: any) {
        setStatusMsg(`[ERROR] Gagal mengubah role: ${err.message}`);
      }
      return;
    }
    if (item.value === "DELETE") {
      try {
        await cliService.deleteUser(selectedUser.id);
        setStatusMsg(`[SUKSES] User ${selectedUser.name} (${selectedUser.email}) berhasil dihapus.`);
        setSelectedUser(null);
        setMode("LIST");
        fetchUsers();
      } catch (err: any) {
        setStatusMsg(`[ERROR] Gagal menghapus: ${err.message}`);
      }
    }
  };

  const handleSaveEditName = async () => {
    if (!selectedUser || !inputValue.trim()) return;
    try {
      await cliService.updateName(selectedUser.id, inputValue.trim());
      setStatusMsg(`[SUKSES] Nama user diubah menjadi: ${inputValue}`);
      setMode("ACTIONS");
      fetchUsers();
    } catch (err: any) {
      setStatusMsg(`[ERROR] Gagal mengubah nama: ${err.message}`);
    }
  };

  const handleSaveEditEmail = async () => {
    if (!selectedUser || !inputValue.trim()) return;
    try {
      await cliService.updateEmail(selectedUser.id, inputValue.trim());
      setStatusMsg(`[SUKSES] Email user diubah menjadi: ${inputValue}`);
      setMode("ACTIONS");
      fetchUsers();
    } catch (err: any) {
      setStatusMsg(`[ERROR] Gagal mengubah email: ${err.message}`);
    }
  };

  return (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor="cyan">
      <HeaderView />
      <StatusView message={statusMsg} />

      {mode === "LIST" && <UserListView userList={userList} onSelectUser={handleSelectUser} />}

      {mode === "SEARCH" && (
        <InputPromptView
          label="Kata kunci pencarian (Nama / Email):"
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={() => setMode("LIST")}
        />
      )}

      {mode === "ACTIONS" && selectedUser && (
        <UserActionsView user={selectedUser} onSelectAction={handleSelectAction} />
      )}

      {mode === "EDIT_NAME" && selectedUser && (
        <InputPromptView
          label={`Ubah Nama untuk ${selectedUser.email}:`}
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSaveEditName}
        />
      )}

      {mode === "EDIT_EMAIL" && selectedUser && (
        <InputPromptView
          label={`Ubah Email untuk ${selectedUser.name}:`}
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSaveEditEmail}
        />
      )}
    </Box>
  );
}

render(<UsersCliApp />);
