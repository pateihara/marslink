//app/_layout.tsx
import { colors } from "@/src/theme/colors";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.bg,
          },
        }}
      />

      <StatusBar style="light" />
    </>
  );
}
