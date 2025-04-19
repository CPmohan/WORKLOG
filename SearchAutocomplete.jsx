import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import TimePicker from './TimePicker';

const SearchAutocomplete = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [searchParam, setSearchParam] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [recentSelections, setRecentSelections] = useState([]);
    const [activeTab, setActiveTab] = useState('recent');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('17:00');

    const handleChange = (query) => {
        setSearchParam(query);
        if (query.length > 1) {
            const filteredData = users.filter(item =>
                item.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredUsers(filteredData);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };

    const handleSelection = (item) => {
        setSearchParam(item);
        setShowDropdown(false);

        if (!recentSelections.includes(item)) {
            setRecentSelections(prev => [item, ...prev].slice(0, 10));
        }
    };

    const toggleFavorite = (item) => {
        setFavorites(prev =>
            prev.includes(item)
                ? prev.filter(fav => fav !== item)
                : [...prev, item]
        );
    };

    const removeRecentItem = (itemToRemove) => {
        setRecentSelections(prev =>
            prev.filter(item => item !== itemToRemove)
        );
    };

    const removeFavoriteItem = (itemToRemove) => {
        setFavorites(prev =>
            prev.filter(item => item !== itemToRemove)
        );
    };

    const fetchListOfUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://10.150.250.243:8080/users");
            const data = await response.json();

            if (Array.isArray(data) && data.length) {
                setUsers(data);
                setError(null);
            } else {
                setUsers([]);
                setError("No users found from server");
            }
        } catch (err) {
            setError("Failed to fetch users: " + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListOfUsers();
    }, []);

    const renderListItem = ({ item }) => (
        <View style={styles.listItemContainer}>
            <TouchableOpacity
                style={styles.listItemText}
                onPress={() => handleSelection(item)}
            >
                <Text>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFavorite(item)}>
                <Icon
                    name={favorites.includes(item) ? "heart" : "heart-o"}
                    size={20}
                    color={favorites.includes(item) ? "red" : "gray"}
                />
            </TouchableOpacity>
        </View>
    );

    const renderRecentItem = ({ item }) => (
        <View style={styles.savedItem}>
            <Text style={styles.itemText}>{item}</Text>
            <TouchableOpacity onPress={() => removeRecentItem(item)}>
                <Icon name="times" size={16} color="#e53e3e" />
            </TouchableOpacity>
        </View>
    );

    const renderFavoriteItem = ({ item }) => (
        <View style={styles.savedItem}>
            <TouchableOpacity onPress={() => removeFavoriteItem(item)}>
                <Icon name="heart" size={16} color="red" style={styles.favIcon} />
            </TouchableOpacity>
            <Text style={styles.itemText}>{item}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4299e1" />
                <Text style={styles.loadingText}>Loading Data... Please wait</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
            <View style={styles.contentContainer}>
                {/* Search Section */}
                <View style={styles.searchSection}>
                    <View style={styles.searchContainer}>
                    <Text style={styles.cardTitle}>Search work log</Text>
                        <TextInput
                            value={searchParam}
                            style={[
                                styles.input,
                                showDropdown && styles.inputWithDropdown
                            ]}
                            placeholder="Search Users here..."
                            placeholderTextColor="#718096"
                            onChangeText={handleChange}
                        />
                        {showDropdown && (
                            <View style={styles.dropdown}>
                                <FlatList
                                    data={filteredUsers}
                                    renderItem={renderListItem}
                                    keyExtractor={(item, index) => index.toString()}
                                    ListEmptyComponent={
                                        <View style={styles.noResults}>
                                            <Text>No results found</Text>
                                        </View>
                                    }
                                    keyboardShouldPersistTaps="always"
                                />
                            </View>
                        )}
                    </View>
                </View>
                
                <View style={styles.timeCardContainer}>
                                {/* <View style={styles.timeCard}> */}
                                    
                                    <View style={styles.row}>
                                        <View style={styles.column}>
                                            <Text style={styles.label }>Start Time</Text>
                                            <TimePicker
                                                value={startTime}
                                                onChange={(time) => setStartTime(time)}
                                                is24Hour={false}
                                            />
                                        </View>
                                        <View style={styles.column}>
                                            <Text style={styles.label}>End Time</Text>
                                            <TimePicker
                                                value={endTime}
                                                onChange={(time) => setEndTime(time)}
                                                is24Hour={false}
                                            />
                                        </View>
                                    </View>
                                {/* </View> */}
                            </View>
                {/* Tabs Section */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
                        onPress={() => setActiveTab('recent')}
                    >
                        <Text style={styles.tabText}>Recent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
                        onPress={() => setActiveTab('favorites')}
                    >
                        <Text style={styles.tabText}>Favorites</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Content with FlatList */}
                <FlatList
                    style={styles.mainContent}
                    data={[]}
                    ListHeaderComponent={
                        <>
                            {/* Empty component - we'll put our content in ListFooterComponent */}
                        </>
                    }
                    ListFooterComponent={
                        <>
                            <FlatList
                                style={styles.savedItemsList}
                                data={activeTab === 'recent' ? recentSelections : favorites}
                                renderItem={activeTab === 'recent' ? renderRecentItem : renderFavoriteItem}
                                keyExtractor={(item, index) => index.toString()}
                                ListEmptyComponent={
                                    <Text style={styles.emptyMessage}>
                                        {activeTab === 'recent' ? 'No recent searches' : 'No favorites yet'}
                                    </Text>
                                }
                                scrollEnabled={false}
                            />

                            <View style={styles.spacer} />
                        </>
                    }
                    renderItem={null}
                    keyboardShouldPersistTaps="handled"
                />
            </View>
        </KeyboardAvoidingView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    searchSection: {
        marginTop: 50,
        marginBottom: 5,
        paddingHorizontal: 15,
    },
    searchContainer: {
        marginBottom: 5,
    },
    input: {
        height: 50,
        paddingHorizontal: 20,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#4299e1',
        borderRadius: 12,
        backgroundColor: '#f0f8ff',
        shadowColor: '#4299e1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    inputWithDropdown: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    dropdown: {
        maxHeight: 200,
        backgroundColor: 'white',
        borderRadius: 8,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderTopWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    listItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    listItemText: {
        flex: 1,
    },
    noResults: {
        padding: 15,
        alignItems: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        marginHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tab: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#4299e1',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
    },
    savedItemsList: {
        marginHorizontal: 15,
        marginBottom: 20,
    },
    savedItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemText: {
        flex: 1,
        marginLeft: 10,
    },
    favIcon: {
        marginRight: 10,
    },
    emptyMessage: {
        textAlign: 'center',
        marginTop: 20,
        color: '#718096',
        marginHorizontal: 15,
    },
    timeCardContainer: {
        paddingHorizontal: 15,
        marginTop: 10,
    },
    timeCard: {
        marginTop:5,
        borderWidth: 1,
        borderColor: '#cbd5e0',
        borderRadius: 12,
        padding: 20,
        backgroundColor: '#f7fafc',
        width: '100%',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a202c',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {
        flex: 1,
        
        
        
    },
    label: {
        
        marginBottom: 8,
        fontSize: 14,
        color: '#2d3748',
        fontWeight: '600',
    },
    spacer: {
        height: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#4a5568',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#e53e3e',
        textAlign: 'center',
    },
});

export default SearchAutocomplete;

