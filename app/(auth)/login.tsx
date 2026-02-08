import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/ui/Input';  

export default function LoginScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#faf5ff', '#f3e8ff', '#ffffff']} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center mb-12">
              <View className="relative mb-8">
                <View className="absolute top-0 left-10 w-24 h-24 bg-cyan-500 rounded-full opacity-90 shadow-2xl" />
                <View className="absolute top-8 left-0 w-24 h-24 bg-purple-500 rounded-full opacity-90 shadow-2xl" />
                <View className="absolute top-16 left-14 w-24 h-24 bg-red-500 rounded-full opacity-90 shadow-2xl" />
              </View>

              <Text className="text-5xl font-extrabold text-purple-600 tracking-tight">
                RoomieHub
              </Text>
              <Text className="text-lg text-gray-600 mt-3 font-medium">
                Welcome back! Login to continue
              </Text>
            </View>

            <View className="space-y-6">
              <Input
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Input
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
              />
              <TouchableOpacity className="items-center mt-2">
                <Text className="text-purple-600 font-medium text-base">
                  Forgot password?
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => console.log('Login pressed - add your logic here')}
                className="rounded-full shadow-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={['#06b6d4', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-5 items-center"
                >
                  <Text className="text-white font-bold text-xl">Login</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/register')}
                className="bg-white rounded-full py-5 items-center shadow-2xl border border-gray-200"
              >
                <Text className="text-gray-800 font-bold text-xl">Register</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}