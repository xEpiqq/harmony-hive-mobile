import React, { useContext } from "react";
import { View, Text, FlatList, StatusBar } from "react-native";

import { ChoirContext } from "@/contexts/ChoirContext";
import { SafeAreaView } from "react-native-safe-area-context";

function Calendar() {
  const choir = useContext(ChoirContext);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayOfWeek = daysOfWeek[date.getUTCDay()];
    const month = months[date.getUTCMonth()];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    return `${dayOfWeek}, ${month} ${day}, ${year}`;
  };

  const daysUntil = (dateString) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const timeDiff = eventDate - today;
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const formatTodayDate = () => {
    const today = new Date();
    const options = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
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
            backgroundColor: isEventPassed(item.date)
              ? "rgba(239, 68, 68, 0.1)"
              : "rgba(34, 197, 94, 0.1)",
            borderColor: isEventPassed(item.date)
              ? "rgba(239, 68, 68, 0.5)"
              : "rgba(34, 197, 94, 0.5)",
            borderWidth: 1,
            borderRadius: 15,
            paddingVertical: 2,
            paddingHorizontal: 6,
          }}
        >
          <Text
            style={{
              color: isEventPassed(item.date)
                ? "rgba(239, 68, 68, 1)"
                : "rgba(34, 197, 94, 1)",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            {isEventPassed(item.date) ? "Passed" : `Upcoming in ${daysUntil(item.date)} ${daysUntil(item.date) === 1 ? "day" : "days"}`}
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
    <SafeAreaView edges={["top"]} style={{ width: "100%", height: "100%", backgroundColor: "white" }}>
      <StatusBar animated={true} hidden={false} barStyle="dark-content" backgroundColor="white" />

      <View className="flex-1 bg-white">
        <View className="flex-row justify-between flex-col p-4 border-b border-gray-200">
          <Text className="text-xl font-bold">Calendar Events</Text>
          <Text className="text-gray-500">
            Today's Date: {formatTodayDate()}
          </Text>
        </View>
        {choir.calendar.length > 0 ? (
          <FlatList
            data={choir.calendar}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.eventId}
          />
        ) : (
          <Text className="px-4 py-2 text-gray-500">No events scheduled</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

export default Calendar;
