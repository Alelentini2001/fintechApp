import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { useAssets } from "expo-asset";
import { ResizeMode, Video } from "expo-av";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Page = () => {
    return (
        <View style={styles.container}>
            <Video
                resizeMode={ResizeMode.COVER}
                isMuted
                isLooping
                shouldPlay
                source={require("@/assets/videos/intro.mp4")}
                style={styles.video}
            />
            <View style={{ marginTop: "15%", padding: 20 }}>
                <Text style={styles.header}>
                    Rediscover Payments with QUPLY!
                </Text>
            </View>
            <View style={styles.buttons}>
                <Link
                    href={"/login"}
                    style={[
                        defaultStyles.pillButton,
                        { flex: 1, backgroundColor: Colors.dark },
                    ]}
                    asChild
                >
                    <TouchableOpacity>
                        <Text
                            style={{
                                color: "white",
                                fontSize: 22,
                                fontWeight: "500",
                            }}
                        >
                            Log In
                        </Text>
                    </TouchableOpacity>
                </Link>
                <Link
                    href={"/signup"}
                    style={[
                        defaultStyles.pillButton,
                        { flex: 1, backgroundColor: "#fff" },
                    ]}
                    asChild
                >
                    <TouchableOpacity>
                        <Text style={{ fontSize: 22, fontWeight: "500" }}>
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
    video: {
        width: "100%",
        height: "100%",
        position: "absolute",
    },
    header: {
        fontSize: 36,
        fontWeight: "900",
        textTransform: "uppercase",
        color: "white",
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
        marginBottom: "15%",
    },
});

export default Page;
