import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface NotificationItem {
  _id: string;
  userEmail: string;
  title: string;
  message: string;
  type: 'Transfer' | 'Transaction' | 'Loan' | 'Security' | string;
  read: boolean;
  createdAt: string;
}

export interface CustomerProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  kycVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export const bankingApi = createApi({
  reducerPath: 'bankingApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Notifications', 'Profile', 'Accounts', 'Transactions', 'Loans'],
  endpoints: builder => ({
    // Notifications
    getNotifications: builder.query<
      { notifications: NotificationItem[]; unreadCount: number },
      void
    >({
      query: () => '/customer/notifications',
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation<
      { success: boolean },
      { id?: string; markAll?: boolean }
    >({
      query: body => ({
        url: '/customer/notifications',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Profile & Security (PIN, Password, 2FA)
    getCustomerProfile: builder.query<{ profile: CustomerProfileData }, void>({
      query: () => '/customer/profile',
      providesTags: ['Profile'],
    }),
    updateCustomerProfile: builder.mutation<
      { success: boolean; message: string },
      {
        action?: 'change-pin' | 'change-password';
        name?: string;
        phone?: string;
        twoFactorEnabled?: boolean;
        currentPin?: string;
        newPin?: string;
        currentPassword?: string;
        newPassword?: string;
      }
    >({
      query: body => ({
        url: '/customer/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile', 'Accounts'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
} = bankingApi;
