import { create } from 'zustand';
import { mountStoreDevtool } from 'simple-zustand-devtools';

const useAuthStore = create((set, get) => ({
    allUserData: null, // Use this to store all user data
    loading: false,

    // Define a 'user' state directly
    user: {
        user_id: null,
        username: null,
    },

    setUser: (user) => set({
        allUserData: user,
        user: {
            user_id: user?.user_id || null,
            username: user?.username || null,
        }
    }),

    setLoading: (loading) => set({ loading }),

    isLoggedIn: () => get().allUserData !== null,
    logout: (onLogout) => {
        set({ allUserData: null, user: { user_id: null, username: null } });
        // Optionally, handle cookie removal and other cleanup here
        if (onLogout) {
            onLogout(); // Trigger the navigation callback
        }
    }
}));

if (import.meta.env.DEV) {
    mountStoreDevtool('Store', useAuthStore);
}

export { useAuthStore };