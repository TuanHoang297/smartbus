import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],          // [{id, title, message, time, read}]
    unreadCount: 0,
  },
  reducers: {
    addMany(state, action) {
      const incoming = action.payload || [];
      for (const n of incoming) {
        if (n?.id == null) continue;
        if (!state.items.find(x => x.id === n.id)) {
          state.items.unshift({ ...n, read: false });
        }
      }
      state.unreadCount = state.items.filter(x => !x.read).length;
    },
    markAllRead(state) {
      state.items = state.items.map(x => ({ ...x, read: true }));
      state.unreadCount = 0;
    },
    markReadById(state, action) {
      const id = action.payload;
      const i = state.items.findIndex(x => x.id === id);
      if (i !== -1) state.items[i].read = true;
      state.unreadCount = state.items.filter(x => !x.read).length;
    },
    resetNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const { addMany, markAllRead, markReadById, resetNotifications } = notificationsSlice.actions;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotifications = (state) => state.notifications.items;
export default notificationsSlice.reducer;
