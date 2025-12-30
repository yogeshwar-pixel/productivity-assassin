// components/Toast.js
// Web-friendly toast notification component

import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';

export default function Toast({ message, type = 'success', visible, onHide, duration = 2000 }) {
    const opacity = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Fade in
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start();

            // Auto-hide after duration
            const timer = setTimeout(() => {
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                }).start(() => {
                    if (onHide) onHide();
                });
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    const colors = {
        success: '#00ff99',
        error: '#ff3333',
        info: '#00aaff'
    };

    return (
        <Animated.View style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: [{ translateX: '-50%' }],
            backgroundColor: colors[type],
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            zIndex: 99999,
            opacity,
            shadowColor: colors[type],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8
        }}>
            <Text style={{
                color: type === 'success' ? '#000' : '#fff',
                fontWeight: 'bold',
                fontSize: 14
            }}>
                {type === 'success' ? '✓ ' : type === 'error' ? '✕ ' : 'ℹ️ '}
                {message}
            </Text>
        </Animated.View>
    );
}
