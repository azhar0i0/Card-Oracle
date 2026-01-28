import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';

type CardActionProps = {
    visible: boolean;
    onClose: () => void;
    card: {
        id: string;
        name: string;
        number: string;
        description: string;
        image_url: string | null;
    };
    onDelete: (cardId: number) => void;
};

const { width } = Dimensions.get('window');

export default function CardAction({ visible, onClose, card, onDelete }: CardActionProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleEdit = () => {
        onClose();
        router.push({
            pathname: '/(app)/addCard',
            params: {
                editMode: 'true',
                cardId: card.id.toString(),
                cardName: card.name,
                cardDescription: card.description,
                cardNumber: card.number,
            },
        });
    };

    const handleDeletePress = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        setShowDeleteConfirm(false);
        onClose();
        onDelete(card.id);
    };

    return (
        <>
            {/* 1. Main Action Modal */}
            <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
                <Pressable style={styles.overlay} onPress={onClose}>
                    <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />
                    <View style={styles.dimLayer} />

                    <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                        <LinearGradient
                            colors={['#1F1F23', '#0A0A0A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientBackground}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <View>
                                    <Text style={styles.headerLabel}>ACTION MENU</Text>
                                    <Text style={styles.cardIdLabel}>Card #{card.number}</Text>
                                </View>
                                <Pressable onPress={onClose} hitSlop={20} style={styles.closeButton}>
                                    <Ionicons name="close" size={20} color="#fff" />
                                </Pressable>
                            </View>

                            {/* Card Preview Box */}
                            <View style={styles.previewContainer}>
                                <LinearGradient
                                    colors={['rgba(233, 184, 111, 0.1)', 'rgba(233, 184, 111, 0.02)']}
                                    style={styles.previewBox}
                                >
                                    <View style={styles.previewLine} />
                                    <Text style={styles.previewTitle} numberOfLines={1}>{card.name}</Text>
                                    <Text style={styles.previewMessage} numberOfLines={2}>{card.description}</Text>
                                </LinearGradient>
                            </View>

                            <Text style={styles.sectionLabel}>Select an action</Text>

                            {/* Creative "Control Grid" Layout */}
                            <View style={styles.actionsGrid}>
                                {/* Edit Tile */}
                                <Pressable
                                    onPress={handleEdit}
                                    style={({ pressed }) => [
                                        styles.actionTile,
                                        { borderColor: 'rgba(233, 184, 111, 0.3)' },
                                        pressed && styles.actionTilePressed
                                    ]}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(233, 184, 111, 0.15)' }]}>
                                        <Ionicons name="pencil" size={24} color="#E9B86F" />
                                    </View>
                                    <Text style={styles.tileTitle}>Edit</Text>
                                    <Text style={styles.tileSubtitle}>Modify Content</Text>
                                </Pressable>

                                {/* Delete Tile */}
                                <Pressable
                                    onPress={handleDeletePress}
                                    style={({ pressed }) => [
                                        styles.actionTile,
                                        { borderColor: 'rgba(239, 68, 68, 0.3)' },
                                        pressed && styles.actionTilePressed
                                    ]}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                                        <Ionicons name="trash" size={24} color="#EF4444" />
                                    </View>
                                    <Text style={[styles.tileTitle, { color: '#EF4444' }]}>Delete</Text>
                                    <Text style={styles.tileSubtitle}>Remove Card</Text>
                                </Pressable>
                            </View>

                        </LinearGradient>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* 2. Delete Confirmation Modal */}
            <Modal visible={showDeleteConfirm} transparent animationType="fade" statusBarTranslucent>
                <Pressable style={styles.overlay} onPress={() => setShowDeleteConfirm(false)}>
                    <BlurView intensity={60} style={StyleSheet.absoluteFill} tint="dark" />
                    <View style={styles.dimLayer} />

                    <Pressable style={styles.alertContainer} onPress={(e) => e.stopPropagation()}>
                        <LinearGradient
                            colors={['#251010', '#000000']}
                            style={styles.gradientBackground}
                        >
                            <View style={styles.alertIconContainer}>
                                <Ionicons name="warning" size={38} color="#EF4444" />
                            </View>

                            <Text style={styles.alertTitle}>Delete Card?</Text>
                            <Text style={styles.alertMessage}>
                                This will permanently remove <Text style={styles.boldText}>"{card.name}"</Text> from your deck.
                            </Text>

                            <View style={styles.buttonGroup}>
                                <Pressable
                                    onPress={() => setShowDeleteConfirm(false)}
                                    style={({ pressed }) => [styles.btnCancel, pressed && { opacity: 0.7 }]}
                                >
                                    <Text style={styles.btnCancelText}>Cancel</Text>
                                </Pressable>

                                <Pressable
                                    onPress={confirmDelete}
                                    style={({ pressed }) => [styles.btnDelete, pressed && { opacity: 0.8 }]}
                                >
                                    <Text style={styles.btnDeleteText}>Confirm</Text>
                                </Pressable>
                            </View>
                        </LinearGradient>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    // --- Shared Overlays ---
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dimLayer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    gradientBackground: {
        padding: 24,
    },
    boldText: {
        fontWeight: '700',
        color: '#fff',
    },

    // --- Main Action Modal ---
    modalContainer: {
        width: width * 0.85,
        maxWidth: 360,
        borderRadius: 28,
        overflow: 'hidden', // Required to clip the LinearGradient corners
        borderWidth: 1.5,   // Slightly thicker for Android visibility
        borderColor: 'rgba(255,255,255,0.15)',
        elevation: 10,      // Required for Android shadows
        backgroundColor: '#1F1F23', // Fallback color
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    headerLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#666',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    cardIdLabel: {
        fontSize: 22,
        fontWeight: '600',
        color: '#fff',
        marginTop: 4,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // --- Preview Box ---
    previewContainer: {
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    previewBox: {
        padding: 16,
    },
    previewLine: {
        width: 24,
        height: 3,
        backgroundColor: '#E9B86F',
        borderRadius: 2,
        marginBottom: 10,
        opacity: 0.8,
    },
    previewTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    previewMessage: {
        color: '#aaa',
        fontSize: 13,
        lineHeight: 18,
    },

    sectionLabel: {
        fontSize: 12,
        color: '#555',
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // --- Grid Layout for Buttons ---
    actionsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    actionTile: {
        flex: 1,
        // Increased background opacity for Android visibility
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.2,
        // Keep aspect ratio but ensure it doesn't clip
        aspectRatio: 1,
    },
    actionTilePressed: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        transform: [{ scale: 0.98 }]
    },
    iconCircle: {
        width: 52, // Slightly larger for better touch target/visibility
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    tileTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    tileSubtitle: {
        fontSize: 11,
        color: '#666',
    },

    // --- Delete Alert ---
    alertContainer: {
        width: width * 0.8,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    alertIconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    alertMessage: {
        fontSize: 14,
        color: '#aaa',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 10,
    },
    btnCancel: {
        flex: 1,
        paddingVertical: 14, // Better than just paddingTop
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    btnCancelText: {
        color: '#ccc',
        fontWeight: '600',
    },
    btnDelete: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        borderRadius: 12,
    },
    btnDeleteText: {
        color: '#fff',
        fontWeight: '700',
    },
});