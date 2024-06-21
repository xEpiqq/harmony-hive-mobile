import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

function Profile({ user }) {
  const [userData, setUserData] = useState(null);
  const [choirNames, setChoirNames] = useState([]);
  const [selectedChoir, setSelectedChoir] = useState(null);
  const [newChoirCode, setNewChoirCode] = useState('');
  const [joinChoirError, setJoinChoirError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const data = userDoc.data();
          setUserData(data);
          setSelectedChoir(data.choir_selected);
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user.uid]);

  useEffect(() => {
    const fetchChoirNames = async () => {
      if (userData && userData.choirs_joined) {
        const choirPromises = userData.choirs_joined.map(async (choirId) => {
          const choirDoc = await firestore().collection('choirs').doc(choirId).get();
          if (choirDoc.exists) {
            return {
              id: choirDoc.id,
              name: choirDoc.data().name,
            };
          }
          return null;
        });

        const choirs = await Promise.all(choirPromises);
        setChoirNames(choirs.filter((choir) => choir !== null));
      }
    };

    fetchChoirNames();
  }, [userData]);

  const handleChoirSelect = async (choirId) => {
    try {
      await firestore().collection('users').doc(user.uid).update({
        choir_selected: choirId,
      });
      setSelectedChoir(choirId);
    } catch (error) {
      console.log('Error updating selected choir:', error);
    }
  };

  const joinChoir = async () => {
    try {
      const choirSnapshot = await firestore().collection('choirs').where('code', '==', newChoirCode).get();
      if (choirSnapshot.empty) {
        setJoinChoirError('Invalid choir code');
        return;
      }

      const choirDoc = choirSnapshot.docs[0];
      const choirId = choirDoc.id;

      await firestore().collection('users').doc(user.uid).update({
        choirs_joined: firestore.FieldValue.arrayUnion(choirId),
      });

      setNewChoirCode('');
      setJoinChoirError('');
      setUserData((prevData) => ({
        ...prevData,
        choirs_joined: [...prevData.choirs_joined, choirId],
      }));
    } catch (error) {
      console.log('Error joining choir:', error);
      setJoinChoirError('Error joining choir');
    }
  };

  const renderChoirItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleChoirSelect(item.id)}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: item.id === selectedChoir ? '#e0f2fe' : 'transparent',
      }}
    >
      <Text style={{ color: '#1f2937' }}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', marginTop: 40 }}>
      {/* Profile info */}
      <View style={{ alignItems: 'center', marginTop: 32 }}>
        <Image source={{ uri: user.photoURL }} style={{ width: 96, height: 96, borderRadius: 48 }} />
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>{user.displayName}</Text>
        <Text style={{ color: '#6b7280' }}>{user.email}</Text>
      </View>

      {/* Choirs section */}
      <View style={{ marginTop: 32 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', paddingHorizontal: 16, marginBottom: 8 }}>Choirs</Text>
        {choirNames.length > 0 ? (
          <FlatList
            data={choirNames}
            renderItem={renderChoirItem}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <Text style={{ paddingHorizontal: 16, paddingVertical: 8, color: '#6b7280' }}>No choirs joined</Text>
        )}
      </View>

      {/* Join new choir */}
      <View style={{ marginTop: 32, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Join New Choir</Text>
        <TextInput
          value={newChoirCode}
          onChangeText={setNewChoirCode}
          placeholder="Enter choir code"
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginBottom: 8,
          }}
        />
        {joinChoirError ? <Text style={{ color: 'red', marginBottom: 8 }}>{joinChoirError}</Text> : null}
        <TouchableOpacity
          onPress={joinChoir}
          style={{
            backgroundColor: '#3b82f6',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}>Join Choir</Text>
        </TouchableOpacity>
      </View>

      {/* Sign out button */}
      <TouchableOpacity
        style={{
          backgroundColor: '#3b82f6',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          marginTop: 32,
          marginHorizontal: 16,
        }}
        onPress={() => auth().signOut()}
      >
        <Text style={{ color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Profile;
