import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { height } = Dimensions.get('window');

const TimePicker = ({ value, onChange, is24Hour = false }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [hours, setHours] = useState(12);
    const [minutes, setMinutes] = useState(0);
    const [isAM, setIsAM] = useState(true);

    const hourScrollRef = useRef();
    const minuteScrollRef = useRef();

    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            const hour = parseInt(h, 10);
            const minute = parseInt(m, 10);
            
            if (!is24Hour) {
                setIsAM(hour < 12);
                setHours(hour % 12 || 12);
            } else {
                setHours(hour);
            }
            setMinutes(minute);
        }
    }, [value, is24Hour]);

    const handleHourChange = (newHour) => {
        setHours(newHour);
        hourScrollRef.current?.scrollTo({ y: (newHour - (is24Hour ? 0 : 1)) * 40, animated: true });
    };

    const handleMinuteChange = (newMinute) => {
        setMinutes(newMinute);
        minuteScrollRef.current?.scrollTo({ y: newMinute * 40, animated: true });
    };

    const handleConfirm = () => {
        let finalHours = hours;
        if (!is24Hour) {
            finalHours = isAM ? (hours % 12) : (hours % 12) + 12;
        }
        onChange(`${finalHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
        setModalVisible(false);
    };

    const formatTime = () => {
        if (!value) return 'Select Time';
        const [h, m] = value.split(':');
        const hour = parseInt(h, 10);
        const minute = parseInt(m, 10);

        if (is24Hour) {
            return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        } else {
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        }
    };

    const setCurrentTime = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();

        if (!is24Hour) {
            setIsAM(hours < 12);
            hours = hours % 12 || 12;
        }

        setHours(hours);
        setMinutes(minutes);
        hourScrollRef.current?.scrollTo({ y: (hours - (is24Hour ? 0 : 1)) * 40, animated: true });
        minuteScrollRef.current?.scrollTo({ y: minutes * 40, animated: true });
    };

    return (
        <View style={styles.timePickerContainer}>
            <TouchableOpacity
                style={styles.timeInput}
                onPress={() => {
                    setModalVisible(true);
                    if (!value) setCurrentTime();
                }}
            >
                <Text style={styles.timeText}>{formatTime()}</Text>
                {/* <Icon name="clock-o" size={20} color="#4299e1" /> */}
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.timeSelector}>
                            <ScrollView
                                ref={hourScrollRef}
                                style={styles.numberColumn}
                                showsVerticalScrollIndicator={false}
                                snapToInterval={40}
                                decelerationRate="fast"
                                contentContainerStyle={styles.scrollContent}
                            >
                                {Array.from({ length: is24Hour ? 24 : 12 }, (_, i) => i + (is24Hour ? 0 : 1)).map((hour) => (
                                    <TouchableOpacity
                                        key={hour}
                                        style={[
                                            styles.numberButton,
                                            hours === hour && styles.selectedNumber
                                        ]}
                                        onPress={() => handleHourChange(hour)}
                                    >
                                        <Text style={styles.numberText}>{hour}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.colon}>:</Text>

                            <ScrollView
                                ref={minuteScrollRef}
                                style={styles.numberColumn}
                                showsVerticalScrollIndicator={false}
                                snapToInterval={40}
                                decelerationRate="fast"
                                contentContainerStyle={styles.scrollContent}
                            >
                                {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                                    <TouchableOpacity
                                        key={minute}
                                        style={[
                                            styles.numberButton,
                                            minutes === minute && styles.selectedNumber
                                        ]}
                                        onPress={() => handleMinuteChange(minute)}
                                    >
                                        <Text style={styles.numberText}>{minute.toString().padStart(2, '0')}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {!is24Hour && (
                                <View style={styles.periodSelector}>
                                    <TouchableOpacity
                                        style={[
                                            styles.periodButton,
                                            isAM && styles.selectedPeriod
                                        ]}
                                        onPress={() => setIsAM(true)}
                                    >
                                        <Text style={styles.periodText}>AM</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.periodButton,
                                            !isAM && styles.selectedPeriod
                                        ]}
                                        onPress={() => setIsAM(false)}
                                    >
                                        <Text style={styles.periodText}>PM</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.nowButton}
                                onPress={setCurrentTime}
                            >
                                <Text style={styles.nowButtonText}>Now</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleConfirm}
                            >
                                <Text style={styles.buttonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    timePickerContainer: {
        marginBottom: 20,
    },
    timeInput: {
        height: 50,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeText: {
        fontSize: 16,
        color: '#1a365d',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    timeSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        height: 200,
    },
    numberColumn: {
        height: 200,
        width: 60,
    },
    scrollContent: {
        paddingVertical: 80,
    },
    numberButton: {
        height: 40,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedNumber: {
        backgroundColor: '#ebf8ff',
        borderRadius: 4,
    },
    numberText: {
        fontSize: 16,
        color: '#1a365d',
    },
    colon: {
        fontSize: 20,
        marginHorizontal: 5,
        color: '#1a365d',
    },
    periodSelector: {
        marginLeft: 10,
    },
    periodButton: {
        padding: 10,
        borderRadius: 4,
        marginVertical: 5,
        alignItems: 'center',
    },
    selectedPeriod: {
        backgroundColor: '#4299e1',
    },
    periodText: {
        fontSize: 16,
        color: '#1a365d',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 15,
    },
    nowButton: {
        padding: 8,
        borderRadius: 4,
        backgroundColor: '#e2e8f0',
    },
    nowButtonText: {
        fontSize: 14,
        color: '#1a365d',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        padding: 10,
        borderRadius: 4,
        backgroundColor: '#e2e8f0',
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    confirmButton: {
        padding: 10,
        borderRadius: 4,
        backgroundColor: '#4299e1',
        flex: 1,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'white',
    },
});

export default TimePicker;