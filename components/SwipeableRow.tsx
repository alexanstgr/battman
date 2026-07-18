import React, { useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import {
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { Ionicons } from "@react-native-vector-icons/ionicons";

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit: () => void;
}

export function SwipeableRow({
  children,
  onDelete,
  onEdit,
}: SwipeableRowProps) {
  const swipeableRef =
    useRef<React.ComponentRef<typeof ReanimatedSwipeable>>(null);

  const close = () => swipeableRef.current?.close();

  const renderLeftActions = (
    progress: SharedValue<number>,
    _translation: SharedValue<number>,
  ) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(progress.value, [0, 1], [-80, 0]),
        },
      ],
    }));

    return (
      <Animated.View style={[styles.actionContainer, animatedStyle]}>
        <RectButton
          style={[styles.action, styles.deleteAction]}
          onPress={() => {
            close();
            setTimeout(onDelete, 200);
          }}
        >
          <Ionicons name="trash" color="#fd0000" size={25} />
        </RectButton>
      </Animated.View>
    );
  };

  const renderRightActions = (
    progress: SharedValue<number>,
    _translation: SharedValue<number>,
  ) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(progress.value, [0, 1], [80, 0]),
        },
      ],
    }));

    return (
      <Animated.View style={[styles.actionContainer, animatedStyle]}>
        <TouchableOpacity
          style={[styles.action, styles.editAction]}
          activeOpacity={0.8}
          onPress={() => {
            close();
            setTimeout(onEdit, 200);
          }}
        >
          <Ionicons name="pencil" color="#000000" size={25} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
      overshootLeft={false}
      overshootRight={false}
    >
      {children}
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    justifyContent: "center",
  },
  action: {
    width: 60,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteAction: {
    borderRadius: 15,
    marginRight: 5,
  },
  editAction: {
    borderRadius: 15,
    marginLeft: 5,
  },
});
