import Colors from "@/constants/Colors";
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Link, Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SecureStore from "expo-secure-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserInactivityProvider } from "@/context/UserInactivity";
import { LogBox } from "react-native";
import i18n from "./(authenticated)/(tabs)/translate";
import { ThemeProvider, useTheme } from "./ThemeContext";
import "@/shim";
import LottieView from "lottie-react-native";
import React from "react";
import CryptoJS from "crypto-js";

LogBox.ignoreAllLogs(); // Ignore log notification by message

const queryClient = new QueryClient();
const CLERK_PUBLISHABLE_KEY =
    "pk_test_Y29tcGxldGUtc2hpbmVyLTMuY2xlcmsuYWNjb3VudHMuZGV2JA";

// Cache the Clerk JWT
const tokenCache = {
    async getToken(key: string) {
        try {
            return SecureStore.getItemAsync(key);
        } catch (err) {
            return null;
        }
    },
    async saveToken(key: string, value: string) {
        try {
            return SecureStore.setItemAsync(key, value);
        } catch (err) {
            return;
        }
    },
};

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
    const [loaded, error] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
        ...FontAwesome.font,
    });

    const router = useRouter();
    const { isLoaded, isSignedIn } = useAuth();
    const segments = useSegments();
    const { user } = useUser();
    const [isMounted, setIsMounted] = useState(true);
    const [link, setLink] = useState("");
    useEffect(() => {
        const handleDeepLink = async (event) => {
            const { url } = event;
            console.log("url", url);
            if (url && user) {
                try {
                    // Parse the deep link URL and extract parameters
                    const parsedUrl = new URL(url);
                    const params = parsedUrl.searchParams;

                    // Extract the encrypted data parameter
                    const encryptedData = params.get("data");
                    console.log("encryptedData", encryptedData);
                    if (encryptedData) {
                        const key = CryptoJS.enc.Hex.parse(
                            "34e2800cde54fb848e48d24a90ef3a2904b9acfaa289f28bcc73ae3fb688aec91028b7624b8ae3341e553092827014b9a756667c204f0928ef64ee56f1cb99dc"
                        );
                        console.log("Decoding encrypted data...");
                        const decodedData = decodeURIComponent(encryptedData);
                        console.log("decodedData", decodedData);
                        // Decrypt the data
                        const bytes = CryptoJS.AES.decrypt(decodedData, key, {
                            mode: CryptoJS.mode.ECB,
                        });

                        // Convert bytes to plaintext
                        const decryptedData = JSON.parse(
                            bytes.toString(CryptoJS.enc.Utf8)
                        );
                        console.log(
                            "decryptedData",
                            JSON.stringify(decryptedData)
                        );

                        setLink(JSON.stringify(decryptedData));
                    } else {
                        console.error("No data parameter found in the URL");
                    }
                } catch (error) {
                    console.error("Error handling deep link:", error);
                }
            }
        };

        Linking.addEventListener("url", handleDeepLink);

        // Check if app was launched from a deep link
        Linking.getInitialURL()
            .then((url) => {
                if (url) {
                    handleDeepLink({ url });
                }
            })
            .catch((err) => console.error("An error occurred", err));

        // Cleanup the event listener
        return () => {
            Linking.removeAllListeners("url");
        };
    }, [isSignedIn, router]);

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);
    const [fontsLoaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
        ...Ionicons.font,
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);

        const timer = setTimeout(() => {
            setLoading(false);
        }, 2500); // 5000 milliseconds = 5 seconds

        // Clean up the timer when the component unmounts or the effect runs again
        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        if (!isLoaded) return;

        const inAuthGroup = segments[0] === "(authenticated)";

        if (isSignedIn) {
            //router.replace("/(authenticated)/(tabs)/crypto");
            router.replace({
                pathname: "/(authenticated)/(modals)/lock",
                params: {
                    linkUrl: link!,
                },
            });
        } else if (!isSignedIn && router) {
            router.replace("/");
        }
    }, [isSignedIn, link]);
    // useEffect(() => {
    //   async function prepare() {
    //     await SplashScreen.preventAutoHideAsync();
    //     if (fontsLoaded && isLoaded) {
    //       SplashScreen.hideAsync();
    //       if (isSignedIn && segments[0] !== "(authenticated)") {
    //         router.replace("/(authenticated)/(modals)/lock");
    //       } else if (!isSignedIn) {
    //         router.replace("/");
    //       }
    //     }
    //   }

    //   prepare();
    // }, [fontsLoaded, isLoaded, isSignedIn, segments]);
    const animation = useRef(null);

    if (!loaded || (!isLoaded && loading)) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {/* <ActivityIndicator size={"large"} color={Colors.dark} /> */}

                <LottieView
                    autoPlay
                    ref={animation}
                    style={{
                        width: 200,
                        height: 200,
                        backgroundColor: "#fffff",
                    }}
                    source={require("@/assets/images/logo.json")}
                />
            </View>
        );
    }
    let colorScheme = useTheme().theme;
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
                name="signup"
                options={{
                    title: "",
                    headerBackTitle: "",
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor:
                            colorScheme === "light"
                                ? Colors.background
                                : Colors.dark,
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={router.back}>
                            <Ionicons
                                name="arrow-back"
                                size={34}
                                color={
                                    colorScheme === "dark"
                                        ? Colors.background
                                        : Colors.dark
                                }
                            />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="login"
                options={{
                    title: "",
                    headerBackTitle: "",
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor:
                            colorScheme === "light"
                                ? Colors.background
                                : Colors.dark,
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={router.back}>
                            <Ionicons
                                name="arrow-back"
                                size={34}
                                color={
                                    colorScheme === "dark"
                                        ? Colors.background
                                        : Colors.dark
                                }
                            />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <Link href={"/help"} asChild>
                            <TouchableOpacity>
                                <Ionicons
                                    name="help-circle-outline"
                                    size={34}
                                    color={Colors.dark}
                                />
                            </TouchableOpacity>
                        </Link>
                    ),
                }}
            />
            <Stack.Screen
                name="verify/[phone]"
                options={{
                    title: "",
                    headerBackTitle: "",
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor:
                            colorScheme === "light"
                                ? Colors.background
                                : Colors.dark,
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={router.back}>
                            <Ionicons
                                name="arrow-back"
                                size={34}
                                color={
                                    colorScheme === "light"
                                        ? Colors.dark
                                        : Colors.background
                                }
                            />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="(authenticated)/(tabs)"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="(authenticated)/crypto/[id]"
                options={{
                    title: "",
                    headerLeft: () => (
                        <TouchableOpacity onPress={router.back}>
                            <Ionicons
                                name="arrow-back"
                                size={34}
                                color={Colors.dark}
                            />
                        </TouchableOpacity>
                    ),
                    headerLargeTitle: true,
                    headerTransparent: true,
                    headerRight: () => (
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <TouchableOpacity>
                                <Ionicons
                                    name="notifications-outline"
                                    size={30}
                                    color={Colors.dark}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Ionicons
                                    name="star-outline"
                                    size={30}
                                    color={Colors.dark}
                                />
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <Stack.Screen
                name="(authenticated)/(modals)/lock"
                options={{ headerShown: false, animation: "none" }}
            />
            <Stack.Screen
                name="(authenticated)/(modals)/account"
                options={{
                    presentation: "transparentModal",
                    animation: "fade",
                    title: "",
                    headerTransparent: true,
                    headerLeft: () => (
                        <TouchableOpacity onPress={router.back}>
                            <Ionicons
                                name="close-outline"
                                size={34}
                                color={"#fff"}
                            />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="help"
                options={{ title: "help", presentation: "modal" }}
            />
            <Stack.Screen
                name="friends"
                options={{
                    title: "Your Friends",
                    presentation: "modal",
                    headerStyle: {
                        backgroundColor:
                            colorScheme === "light"
                                ? Colors.background
                                : Colors.dark,
                    },
                    headerTitleStyle: {
                        color:
                            colorScheme === "dark"
                                ? Colors.background
                                : Colors.dark,
                    },
                }}
            />
            <Stack.Screen
                name="terms"
                options={{
                    title: "Terms and Conditions",
                    presentation: "modal",
                    headerStyle: {
                        backgroundColor:
                            colorScheme === "light"
                                ? Colors.background
                                : Colors.dark,
                    },
                    headerTitleStyle: {
                        color:
                            colorScheme === "dark"
                                ? Colors.background
                                : Colors.dark,
                    },
                }}
            />
        </Stack>
    );
};

const RootLayoutNav = () => {
    return (
        <ClerkProvider
            publishableKey={CLERK_PUBLISHABLE_KEY!}
            tokenCache={tokenCache}
        >
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <UserInactivityProvider>
                        <GestureHandlerRootView style={{ flex: 1 }}>
                            <StatusBar style={"auto"} />
                            <InitialLayout />
                        </GestureHandlerRootView>
                    </UserInactivityProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ClerkProvider>
    );
};
export default RootLayoutNav;
