/* eslint-disable */
"use client";
import SettingsForm from "@/components/SettingsForm";
import {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
} from "@/state/api";
import React from "react";

const TenantSettings = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  if (isLoading) return <div>Loading...</div>;

  const initialData = {
    name: authUser?.userInfo.name || "",
    email: authUser?.userInfo.email || "",
    phoneNumber: authUser?.userInfo.phoneNumber || "",
  };

  const handleSubmit = async (data: typeof initialData) => {
    await updateTenant({
      cognitoId: authUser?.cognitoInfo.userId || "",
      ...data,
    });
  };
  const [updateTenant] = useUpdateTenantSettingsMutation();
  return (
    <div>
      <SettingsForm
        initialData={initialData}
        onSubmit={handleSubmit}
        userType="tenant"
      />
    </div>
  );
};

export default TenantSettings;
