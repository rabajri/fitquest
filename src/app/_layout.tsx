import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Food screens slide up over the dashboard */}
      <Stack.Screen name="add-food" options={{ presentation: 'modal' }} />
      <Stack.Screen name="edit-food" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
