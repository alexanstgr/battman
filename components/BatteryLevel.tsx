import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from '@/constants/colors'

const levels = {
    charged: 'battery-full',
    charging: 'battery-charging',
    discharged: 'battery-dead',
} as const;

const statColors = {
    charged: colors.charged,
    charging: colors.charging,
    discharged: colors.discharged
} as const;

type BatteryStatus = keyof typeof levels;

interface Props {
    status: BatteryStatus;
}

export default function BatteryLevel({ status }: Props) {
    return (
        <View>
            <Ionicons name={levels[status]} size={18} color={statColors[status]} />
        </View>
    );
}