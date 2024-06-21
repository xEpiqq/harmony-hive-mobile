import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';

function Calendar({ user }) {
  const [events, setEvents] = useState([]);
  const [choirId, setChoirId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userSubscriberUnsubscribe = () => {};

    const fetchCalendarEvents = async (choirId) => {
      try {
        console.log(`Fetching events for choirId: ${choirId}`);
        const calendarSnapshot = await firestore()
          .collection('choirs')
          .doc(choirId)
          .collection('calendar')
          .get();

        const eventsData = calendarSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date, // Keep date as string
        }));

        // Sort events by date
        eventsData.sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log('Fetched and sorted events data:', eventsData);
        setEvents(eventsData);
      } catch (error) {
        console.log('Error fetching calendar events:', error);
      } finally {
        setLoading(false);
      }
    };

    const userSubscriber = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(userDocumentSnapshot => {
        const userData = userDocumentSnapshot.data();
        console.log('Fetched user data:', userData);
        const selectedChoir = userData?.choir_selected;
        setChoirId(selectedChoir);

        if (selectedChoir) {
          fetchCalendarEvents(selectedChoir);
        } else {
          setLoading(false);
        }
      });

    userSubscriberUnsubscribe = userSubscriber;

    return () => {
      userSubscriberUnsubscribe();
    };
  }, [user.uid]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const daysOfWeek = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const dayOfWeek = daysOfWeek[date.getUTCDay()];
    const month = months[date.getUTCMonth()];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    
    return `${dayOfWeek}, ${month} ${day}, ${year}`;
  };
  
  

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const formatTodayDate = () => {
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return today.toLocaleDateString(undefined, options);
  };

  const isEventPassed = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate < today;
  };

  const renderEventItem = ({ item }) => (
    <View className="border-b border-gray-200 px-4 py-2">
      <View className="flex-row justify-between items-center">
        <Text className="font-bold text-lg">{item.name}</Text>
        <View
          style={{
            backgroundColor: isEventPassed(item.date) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            borderColor: isEventPassed(item.date) ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)',
            borderWidth: 1,
            borderRadius: 15,
            paddingVertical: 2,
            paddingHorizontal: 6,
          }}
        >
          <Text
            style={{
              color: isEventPassed(item.date) ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          >
            {isEventPassed(item.date) ? 'Passed' : 'Upcoming'}
          </Text>
        </View>
      </View>
      <Text className="text-gray-500">{formatDate(item.date)}</Text>
      <Text className="text-gray-500">{formatTime(item.time)}</Text>
      <Text className="text-gray-700">{item.location}</Text>
      <Text className="text-gray-500">{item.notes}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white mt-10">
      <View className="flex-row justify-between flex-col px-4 mb-2">
        <Text className="text-xl font-bold">Calendar Events</Text>
        <Text className="text-gray-500">Today's Date: {formatTodayDate()}</Text>
      </View>
      {loading ? (
        <Text className="px-4 py-2 text-gray-500">Loading...</Text>
      ) : events.length > 0 ? (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text className="px-4 py-2 text-gray-500">No events scheduled</Text>
      )}
    </View>
  );
}

export default Calendar;
