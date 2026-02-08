import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#faf5ff', '#f3e8ff', '#ffffff']} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center items-center px-8">
          <View className="relative mb-10">
            <View className="absolute top-0 left-10 w-32 h-32 bg-cyan-500 rounded-full opacity-90 shadow-2xl" />
            <View className="absolute top-10 left-0 w-32 h-32 bg-purple-500 rounded-full opacity-90 shadow-2xl" />
            <View className="absolute top-20 left-14 w-32 h-32 bg-red-500 rounded-full opacity-90 shadow-2xl" />
          </View>

          <Text className="text-6xl font-extrabold text-purple-600 tracking-tight text-center">
            RoomieHub
          </Text>

          <Text className="text-xl text-gray-600 mt-6 text-center font-medium">
            The ultimate solution for shared living management.
          </Text>

          <Text className="text-base text-gray-500 mt-4 text-center">
            Manage expenses, chores, and stay connected with your roommates effortlessly.
          </Text>
        </View>

        <View className="px-8 pb-10 space-y-8">
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="rounded-full shadow-2xl overflow-hidden"
          >
            <LinearGradient
              colors={['#06b6d4', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-5 items-center"
            >
              <Text className="text-white font-bold text-xl">Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text className="text-gray-400 text-center text-sm">
            Version 1.0.0
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}