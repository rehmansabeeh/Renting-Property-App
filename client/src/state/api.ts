import { createNewUserInDatabase } from "@/lib/utils";
import { Manager, Tenant } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};
      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: [],
  endpoints: (build) => ({
    getAuthUser: build.query<User, void>({
      queryFn: async (_arg, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};
          const user = await getCurrentUser();
          const userRole = idToken?.payload["custom:role"] as string;
          const endpoint =
            userRole === "manager"
              ? `/managers/${user.userId}`
              : `/tenants/${user.userId}`;
          console.log("endpoint", endpoint);
          let userDetailsResponse = await fetchWithBQ({ url: endpoint });
          console.log("userDetailsResponse", userDetailsResponse);
          if (
            userDetailsResponse.error &&
            userDetailsResponse?.error?.status === 404
          ) {
            console.log("User details not found, creating new user");

            // If user details not found, create a new user
            const createUserResponse = await createNewUserInDatabase(
              user,
              userRole,
              fetchWithBQ
            );

            if (createUserResponse.error) {
              return { error: { status: 500, data: "Internal Server Error" } };
            }
            userDetailsResponse = createUserResponse;
          }

          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole: userRole,
            },
          };
        } catch (error) {
          return { error: { status: 500, data: "Internal Server Error" } };
        }
      },
    }),
  }),
});

export const { useGetAuthUserQuery } = api;
