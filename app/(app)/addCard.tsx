import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// supabase
import { supabase } from '@/lib/supabase';

const bgImage = require('../../assets/images/magic_bg.png');

export default function AddCardScreen() {
    const { editMode, cardId, cardName: paramCardName, cardDescription: paramCardDescription, cardNumber: paramCardNumber } = useLocalSearchParams();

    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardDescription, setCardDescription] = useState('');
    const [cardImage, setCardImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const isEditing = editMode === 'true';

    useEffect(() => {
        if (isEditing) {
            setCardName((paramCardName as string) || '');
            setCardNumber((paramCardNumber as string) || '');
            setCardDescription((paramCardDescription as string) || '');
        }
    }, [isEditing, paramCardName, paramCardNumber, paramCardDescription]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access gallery is required');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setCardImage(result.assets[0].uri);
        }
    };

    const uploadImageToSupabase = async (uri: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();

        // FIX: force a valid extension + mime type
        const fileName = `${Date.now()}.jpg`;

        const { error } = await supabase.storage
            .from('card-images')
            .upload(fileName, blob, {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (error) {
            console.log('UPLOAD ERROR:', error);
            throw error;
        }

        const { data } = supabase.storage
            .from('card-images')
            .getPublicUrl(fileName);

        return data.publicUrl;
    };

    const handleAddCard = async () => {
        setErrorMsg('');

        // Validation
        if (!cardName.trim()) {
            setErrorMsg('Card name is required');
            return;
        }
        if (!cardNumber.trim()) {
            setErrorMsg('Card number is required');
            return;
        }
        if (!cardDescription.trim()) {
            setErrorMsg('Card description is required');
            return;
        }

        setLoading(true);

        try {
            let imageUrl = null;

            if (cardImage) {
                imageUrl = await uploadImageToSupabase(cardImage);
            }

            if (isEditing && cardId) {
                const { error } = await supabase
                    .from('cards')
                    .update({
                        name: cardName,
                        number: cardNumber,
                        description: cardDescription,
                        image_url: imageUrl,
                    })
                    .eq('id', cardId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('cards')
                    .insert({
                        name: cardName,
                        number: cardNumber,
                        description: cardDescription,
                        image_url: imageUrl,
                    });

                if (error) throw error;
            }

            router.replace('/(app)/allCards');
        } catch (error) {
            setErrorMsg(isEditing ? 'Failed to update card. Please try again.' : 'Failed to add card. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-900">
            <ImageBackground
                source={bgImage}
                blurRadius={Platform.OS === 'web' ? 2 : 5}
                className="flex-1"
            >
                {/* Overlay */}
                <View className="absolute inset-0 bg-black/60" />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <SafeAreaView className="flex-1">
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        >
                            {/* Header */}
                            <View className="px-6 pt-4 pb-8 flex-row items-center justify-between">
                                <Link href="/(app)/allCards" asChild>
                                    <Pressable>
                                        <Ionicons name="chevron-back" size={24} color="#9CA3AF" />
                                    </Pressable>
                                </Link>

                                <Text className="text-gray-400 text-sm tracking-[2px] uppercase font-light">
                                    {isEditing ? 'Edit Card' : 'Add Card'}
                                </Text>

                                <View style={{ width: 24 }} />
                            </View>

                            {/* Card Preview */}
                            <View className="px-6 mb-8 items-center">
                                <View className="w-72 h-[420px] rounded-[32px] bg-neutral-900 border border-white/10 overflow-hidden shadow-2xl">
                                    <LinearGradient
                                        colors={['#1e1e1e', '#000']}
                                        className="flex-1 justify-between p-8"
                                    >
                                        <View className="items-center">
                                            <Text className="text-amber-200/40 tracking-[4px] uppercase text-[10px] font-bold">The Oracle</Text>
                                            <View className="h-[1px] w-16 bg-amber-200/20 mt-2" />
                                        </View>

                                        <View className="items-center">
                                            <Text className="text-white text-4xl font-light text-center" numberOfLines={2}>
                                                {cardName || 'Card Name'}
                                            </Text>
                                            <Text className="text-amber-200/60 italic mt-4 text-center text-sm" numberOfLines={3}>
                                                {cardDescription || 'Card Description'}
                                            </Text>
                                        </View>

                                        <Text className="text-gray-500 text-center text-xs italic">
                                            Card #{cardNumber || '?'}
                                        </Text>
                                    </LinearGradient>
                                </View>
                            </View>

                            {/* Form Container */}
                            <View className="px-6">
                                <View className="rounded-3xl overflow-hidden border border-white/20">
                                    <LinearGradient
                                        colors={['rgba(30, 30, 30, 0.8)', 'rgba(0, 0, 0, 0.8)']}
                                        className="p-6"
                                    >
                                        {/* Error Message */}
                                        {errorMsg ? (
                                            <View className="mb-4 rounded-lg border border-red-500 bg-red-500/20 px-3 py-2">
                                                <Text className="text-center text-sm text-red-200">
                                                    {errorMsg}
                                                </Text>
                                            </View>
                                        ) : null}

                                        {/* Card Image Field */}
                                        <View className="mb-5">
                                            <Text className="text-gray-300 text-sm font-semibold mb-2 tracking-wide">
                                                Card Image
                                            </Text>
                                            <Pressable
                                                onPress={pickImage}
                                                disabled={loading}
                                                style={{ opacity: loading ? 0.6 : 1 }}
                                            >
                                                <View className="bg-slate-900/60 rounded-xl px-4 h-32 border-2 border-dashed border-amber-200/40 justify-center items-center">
                                                    {cardImage ? (
                                                        <View className="w-full h-full items-center justify-center rounded-lg overflow-hidden">
                                                            <Image
                                                                source={{ uri: cardImage }}
                                                                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                                                            />
                                                        </View>
                                                    ) : (
                                                        <View className="items-center gap-2">
                                                            <Ionicons name="image-outline" size={32} color="#E9B86F" />
                                                            <Text className="text-amber-200/60 text-sm font-medium">Tap to select image</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </Pressable>
                                        </View>

                                        {/* Card Name Field */}
                                        <View className="mb-5">
                                            <Text className="text-gray-300 text-sm font-semibold mb-2 tracking-wide">
                                                Card Name
                                            </Text>
                                            <View className="flex-row items-center bg-slate-900/60 rounded-xl px-4 h-14 border border-white/10">
                                                <Ionicons name="bookmark-outline" size={18} color="#D1D5DB" />
                                                <TextInput
                                                    className="flex-1 text-white text-base ml-3"
                                                    placeholder="Enter card name"
                                                    placeholderTextColor="#6B7280"
                                                    value={cardName}
                                                    onChangeText={setCardName}
                                                    editable={!loading}
                                                />
                                            </View>
                                        </View>

                                        {/* Card Number Field */}
                                        <View className="mb-5">
                                            <Text className="text-gray-300 text-sm font-semibold mb-2 tracking-wide">
                                                Card Number
                                            </Text>
                                            <View className="flex-row items-center bg-slate-900/60 rounded-xl px-4 h-14 border border-white/10">
                                                <Ionicons name="hash" size={18} color="#D1D5DB" />
                                                <TextInput
                                                    className="flex-1 text-white text-base ml-3"
                                                    placeholder="Enter card number"
                                                    placeholderTextColor="#6B7280"
                                                    value={cardNumber}
                                                    onChangeText={setCardNumber}
                                                    keyboardType="numeric"
                                                    editable={!loading}
                                                />
                                            </View>
                                        </View>

                                        {/* Description Field */}
                                        <View className="mb-6">
                                            <Text className="text-gray-300 text-sm font-semibold mb-2 tracking-wide">
                                                Description
                                            </Text>
                                            <View className="bg-slate-900/60 rounded-xl px-4 py-3 border border-white/10 min-h-24">
                                                <TextInput
                                                    className="text-white text-base flex-1"
                                                    placeholder="Enter card description"
                                                    placeholderTextColor="#6B7280"
                                                    value={cardDescription}
                                                    onChangeText={setCardDescription}
                                                    multiline
                                                    numberOfLines={4}
                                                    textAlignVertical="top"
                                                    editable={!loading}
                                                />
                                            </View>
                                        </View>

                                        {/* Add/Update Button */}
                                        <Pressable
                                            onPress={handleAddCard}
                                            disabled={loading}
                                            style={{ opacity: loading ? 0.6 : 1 }}
                                        >
                                            <LinearGradient
                                                colors={['#D946EF', '#4F46E5']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={{
                                                    height: 56,
                                                    borderRadius: 16,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }}>
                                                    {loading ? (isEditing ? 'UPDATING...' : 'ADDING...') : (isEditing ? 'UPDATE CARD' : 'ADD CARD')}
                                                </Text>
                                            </LinearGradient>
                                        </Pressable>
                                    </LinearGradient>
                                </View>

                                {/* Info Text */}
                                <View className="mt-8 items-center">
                                    <Text className="text-gray-500 text-xs text-center leading-5">
                                        {isEditing ? 'Update the oracle card information below.' : 'Add a new oracle card to your collection. Fill in all fields to continue.'}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
}
