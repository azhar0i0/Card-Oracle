import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CardAction from '../../components/CardAction';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type Card = {
    id: string;
    name: string;
    number: string;
    description: string;
    image_url: string | null;
};

export default function AllCardsScreen() {
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [isCardActionVisible, setIsCardActionVisible] = useState(false);

    // fecthing cards from supabase
    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .order('id', { ascending: true });

        console.log('DATA FROM SUPABASE:', data);

        if (error) {
            console.log('FETCH ERROR:', error);
            return;
        }

        setCards(data || []);
    };

    const handleCardPress = (card: Card) => {
        setSelectedCard(card);
        setIsCardActionVisible(true);
    };

    const handleDeleteCard = async (cardId: string) => {
        // log current cards before deletion
        console.log('Before delete:', cards.map(c => c.id));

        // delete card
        const { error: deleteError } = await supabase
            .from('cards')
            .delete()
            .eq('id', cardId);

        if (deleteError) {
            console.log('DELETE ERROR:', deleteError);
            return;
        }

        console.log('Deleted card:', cardId);

        // fetch updated cards **and wait for it**
        const { data: newData, error: fetchError } = await supabase
            .from('cards')
            .select('*')
            .order('id', { ascending: true });

        if (fetchError) {
            console.log('FETCH ERROR AFTER DELETE:', fetchError);
        } else {
            console.log('After fetch:', newData?.map(c => c.id));
            setCards(newData || []);
        }
    };

    const renderCard = ({ item }: { item: Card }) => (
        <Pressable
            style={{ width: CARD_WIDTH, marginBottom: 16 }}
            onPress={() => handleCardPress(item)}
        >
            <View className="rounded-[24px] overflow-hidden shadow-lg">
                <LinearGradient
                    colors={['#1e1e1e', '#000']}
                    className="p-6 justify-between"
                    style={{ minHeight: 220 }}
                >
                    <View className="items-center">
                        <Text className="text-amber-200/40 tracking-[3px] uppercase text-[8px] font-bold">Oracle</Text>
                        <View className="h-[1px] w-12 bg-amber-200/20 mt-1.5" />
                    </View>

                    <View className="items-center">
                        <Text className="text-white text-lg font-light text-center leading-6">
                            {item.name}
                        </Text>
                    </View>

                    <Text className="text-gray-500 text-center text-xs italic">Card #{item.number}</Text>
                </LinearGradient>
            </View>
        </Pressable>
    );

    return (
        <View className="flex-1 bg-gradient-to-b from-slate-950 to-slate-900">
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-6 pt-4 pb-6">
                    <View className="flex-row items-center justify-between">
                        {/* Right: Back Button */}
                        <Link href="/(app)/home" asChild>
                            <Pressable>
                                <Ionicons name="chevron-back" size={24} color="#9CA3AF" />
                            </Pressable>
                        </Link>

                        {/* Center: All Cards Title */}
                        <Text className="text-gray-400 text-sm tracking-[2px] uppercase font-light">
                            All Cards
                        </Text>

                        {/* Left: Card Count with Border */}
                        <View className="border border-amber-200/40 rounded-lg px-4 py-2">
                            <Text className="text-amber-200/60 text-xs tracking-[1px] uppercase font-light">
                                {cards.length} Cards
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Cards Grid */}
                <FlatList
                    data={cards}
                    renderItem={renderCard}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    scrollIndicatorInsets={{ right: 1 }}
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>

            {/* Floating Action Button */}
            <Link href="/(app)/addCard" asChild>
                <Pressable
                    style={{
                        position: 'absolute',
                        bottom: 32,
                        right: 24,
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                >
                    <LinearGradient
                        colors={['#D946EF', '#4F46E5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 32,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Ionicons name="add" size={32} color="white" />
                    </LinearGradient>
                </Pressable>
            </Link>

            {/* Card Action Modal */}
            {selectedCard && (
                <CardAction
                    visible={isCardActionVisible}
                    onClose={() => setIsCardActionVisible(false)}
                    card={selectedCard}
                    onDelete={handleDeleteCard}
                />
            )}
        </View>
    );
}
