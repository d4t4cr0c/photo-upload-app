import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const UIShowcase: React.FC = () => {
  return (
    <ScrollView className="flex-1 bg-black p-6">
      <Text className="mb-8 text-center text-2xl font-bold text-white">UI Style Showcase</Text>

      {/* Action Buttons - Upload */}
      <Text className="mb-4 text-lg font-semibold text-gray-300">Action Buttons (Clickable)</Text>

      {/* Current Style - Larger text */}
      <TouchableOpacity className="mb-4 rounded-2xl border border-green-400/30 bg-green-500/20 px-6 py-6">
        <View className="flex-row items-center justify-center">
          <Ionicons name="cloud-upload-outline" size={24} color="#86efac" />
          <Text className="ml-2 text-xl font-black text-green-300">Publicar en Mercado Libre</Text>
        </View>
      </TouchableOpacity>

      {/* Status Messages (Non-interactive) */}
      <Text className="mb-4 mt-8 text-lg font-semibold text-gray-300">
        Status Messages (Read-only)
      </Text>

      {/* Processing - Current - More subtle */}
      <View className="mb-3 rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-4">
        <View className="flex-row items-center justify-center">
          <Ionicons name="hourglass-outline" size={18} color="#facc15" />
          <Text className="ml-2 text-lg font-medium text-yellow-400/90">
            Procesando imágenes...
          </Text>
        </View>
      </View>

      {/* Success Messages - Subtle */}
      <View className="mb-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
        <View className="flex-row items-center justify-center">
          <Ionicons name="checkmark-circle-outline" size={18} color="#34d399" />
          <Text className="ml-2 text-lg font-medium text-emerald-400/90">¡Publicación creada!</Text>
        </View>
      </View>

      {/* Error Messages - Subtle but noticeable */}
      <View className="bg-red-500/12 mb-3 rounded-xl border border-red-400/25 p-4">
        <View className="flex-row items-center justify-center">
          <Ionicons name="close-circle-outline" size={18} color="#f87171" />
          <Text className="ml-2 text-lg font-medium text-red-400/90">
            Error al procesar imágenes
          </Text>
        </View>
      </View>

      <View className="mb-3 rounded-lg border border-rose-400/25 bg-rose-500/10 p-4">
        <View className="flex-row items-center justify-center">
          <Ionicons name="alert-circle-outline" size={16} color="#fb7185" />
          <Text className="ml-2 text-base font-medium text-rose-400/80">
            Algo salió mal, intenta nuevamente
          </Text>
        </View>
      </View>

      {/* MercadoLibre Action Buttons */}
      <Text className="mb-4 mt-8 text-lg font-semibold text-gray-300">
        MercadoLibre Action Buttons
      </Text>

      {/* Variation 3: With subtle gradient effect */}
      <TouchableOpacity className="mb-4 rounded-2xl border border-yellow-500/30 bg-yellow-400 px-6 py-6 shadow-2xl">
        <View className="flex-row items-center justify-center">
          <Ionicons name="open-outline" size={24} color="#000" />
          <Text className="ml-2 text-xl font-black text-black">Ver en Mercado Libre</Text>
        </View>
      </TouchableOpacity>

      {/* Reset Button */}
      <Text className="mb-4 mt-8 text-lg font-semibold text-gray-300">Reset Button</Text>

      {/* Reset button style */}
      <TouchableOpacity className="mb-4 rounded-2xl border border-gray-400/30 bg-green-500/20 px-6 py-6">
        <View className="flex-row items-center justify-center">
          <Ionicons name="refresh-outline" size={24} color="#9ca3af" />
          <Text className="ml-2 text-xl font-black text-green-300">Cargar nuevo producto</Text>
        </View>
      </TouchableOpacity>

      {/* More experimental styles */}
      <Text className="mb-4 mt-8 text-lg font-semibold text-gray-300">Experimental Styles</Text>
    </ScrollView>
  );
};
