import { useAuth, useSignUp, useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
} from "react-native";
import { BlurView } from "expo-blur";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import { storage } from "@/interfaces/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import React from "react";

const Page = () => {
    const { user } = useUser();
    const [firstName, setFirstName] = useState(user?.firstName);
    const [lastName, setLastName] = useState(user?.lastName);
    const [edit, setEdit] = useState(false);
    const [editUsername, setEditUsername] = useState(false);
    const [username, setUsername] = useState(user?.username);
    const [editEmail, setEditEmail] = useState(false);
    const [email, setEmail] = useState(user?.primaryEmailAddress?.toString());

    const onSaveUser = async () => {
        console.log(user?.primaryPhoneNumber?.phoneNumber.toString());

        try {
            await user?.update({ firstName: firstName!, lastName: lastName! });
            setEdit(false);
            try {
                firestore()
                    .collection("users")
                    .where(
                        "email",
                        "==",
                        user?.primaryEmailAddress?.emailAddress || "test"
                    )
                    .get()
                    .then((querySnapshot) => {
                        // Handle the case where no matching email documents found
                        if (querySnapshot.empty) {
                            console.log(
                                "No documents found with matching email."
                            );
                            // If no email match, try phone
                            return firestore()
                                .collection("users")
                                .where(
                                    "phone",
                                    "==",
                                    user?.primaryPhoneNumber?.phoneNumber ||
                                        "test"
                                )
                                .get();
                        }
                        return querySnapshot; // Return the found snapshot
                    })
                    .then((querySnapshot) => {
                        // This could be the result of either email or phone query
                        if (querySnapshot.empty) {
                            console.log(
                                "No documents found with matching phone."
                            );
                            return; // Exit if no documents are found
                        }

                        // If there are matching documents, update each one
                        querySnapshot.forEach((doc) => {
                            doc.ref
                                .update({
                                    firstName: firstName, // Assuming user.imageUrl contains the base64 string of the new avatar
                                    lastName: lastName,
                                })
                                .then(() => {
                                    console.log(
                                        "User avatar updated successfully."
                                    );
                                })
                                .catch((error) => {
                                    console.error(
                                        "Error updating avatar:",
                                        error
                                    );
                                });
                        });
                    })
                    .catch((error) => {
                        console.error("Error retrieving user:", error);
                    });
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setEdit(false);
        }
    };
    const onSaveUsername = async () => {
        try {
            await user?.update({ username: username?.toString() });
            setEditUsername(false);
            firestore()
                .collection("users")
                .where(
                    "email",
                    "==",
                    user?.primaryEmailAddress?.emailAddress || "test"
                )
                .get()
                .then((querySnapshot) => {
                    // Handle the case where no matching email documents found
                    if (querySnapshot.empty) {
                        console.log("No documents found with matching email.");
                        // If no email match, try phone
                        return firestore()
                            .collection("users")
                            .where(
                                "phone",
                                "==",
                                user?.primaryPhoneNumber?.phoneNumber || "test"
                            )
                            .get();
                    }
                    return querySnapshot; // Return the found snapshot
                })
                .then((querySnapshot) => {
                    // This could be the result of either email or phone query
                    if (querySnapshot.empty) {
                        console.log("No documents found with matching phone.");
                        return; // Exit if no documents are found
                    }

                    // If there are matching documents, update each one
                    querySnapshot.forEach((doc) => {
                        doc.ref
                            .update({
                                username: username, // Assuming user.imageUrl contains the base64 string of the new avatar
                            })
                            .then(() => {
                                console.log(
                                    "User avatar updated successfully."
                                );
                            })
                            .catch((error) => {
                                console.error("Error updating avatar:", error);
                            });
                    });
                })
                .catch((error) => {
                    console.error("Error retrieving user:", error);
                });
        } catch (error) {
            console.error(error);
            if (error.errors) {
                error.errors.forEach((err) => {
                    console.error(err.code, err.message);
                });
            }
        } finally {
            setEditUsername(false);
        }
    };
    const router = useRouter();
    const [newEmail, setNewEmail] = useState("");

    const handleSetPrimary = async (emailId) => {
        if (user) {
            try {
                await user?.update({ primaryEmailAddressId: emailId });
                alert("Primary email updated.");
            } catch (error) {
                console.error("Failed to set primary email:", error);
                alert("Failed to update primary email.");
            }
        }
    };

    const onSaveEmail = async () => {
        if (newEmail) {
            try {
                // Assuming `user` is available via useUser() hook from Clerk.
                // First, add the email address to the user account.
                console.log("START");
                const emailAddress = await user?.createEmailAddress({
                    email: newEmail!,
                });
                console.log("Email address added:", emailAddress?.id);
                await emailAddress?.prepareVerification({
                    strategy: "email_code",
                });
                router.dismiss();
                router.navigate({
                    pathname: "/verify/[phone]",
                    params: { email: newEmail, edit: true },
                });

                setEditEmail(false); // UI state updated to reflect the end of the editing process.
            } catch (error) {
                console.error("Failed to save email:", error);
                if (error.errors) {
                    error.errors.forEach((err) => {
                        console.error(err.code, err.message);
                    });
                }
                setEditEmail(false); // Ensure UI state is reset even on error.
            }
        } else {
            console.error("No email set");
        }
    };

    const onCaptureImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.75,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets[0].base64) {
            const base64Image = `data:image/png;base64,${result.assets[0].base64}`;
            //   console.log(base64Image);
            const imageUri = result.assets[0].uri; // Correctly get the local file URI

            if (user?.id) {
                // Assuming setProfileImage method exists and works as expected
                user.setProfileImage({ file: base64Image });
                console.log(
                    user?.primaryEmailAddress
                        ? user?.primaryEmailAddress?.emailAddress
                        : "test"
                );
                const imageName = `uploads/${
                    user.id
                }/${new Date().getTime()}.jpg`; // Creating a unique name for the image file based on user ID and timestamp
                console.log(imageName);
                let reference;
                let url;
                try {
                    reference = ref(storage, imageName);
                    //   reference = storage().ref(imageName);
                    console.log("Test");
                    const response = await fetch(imageUri);
                    const blob = await response.blob(); // Convert the image URI to a blob which is required by Firebase
                    await uploadBytes(reference, blob);
                    url = await getDownloadURL(reference);
                } catch (error) {
                    console.error("Failed to create storage reference:", error);
                    if (error.errors) {
                        error.errors.forEach((err) => {
                            console.error(err.code, err.message);
                        });
                    }
                }
                // await reference?.putFile(imageUri);
                // Get the URL of the uploaded image
                console.log("Uploaded Image URL: ", url);

                // Fetch the user's document using the user id and then update the avatar field
                firestore()
                    .collection("users")
                    .where(
                        "email",
                        "==",
                        user?.primaryEmailAddress?.emailAddress || "test"
                    )
                    .get()
                    .then((querySnapshot) => {
                        // Handle the case where no matching email documents found
                        if (querySnapshot.empty) {
                            console.log(
                                "No documents found with matching email."
                            );
                            // If no email match, try phone
                            return firestore()
                                .collection("users")
                                .where(
                                    "phone",
                                    "==",
                                    user?.primaryPhoneNumber?.phoneNumber ||
                                        "test"
                                )
                                .get();
                        }
                        return querySnapshot; // Return the found snapshot
                    })
                    .then((querySnapshot) => {
                        // This could be the result of either email or phone query
                        if (querySnapshot.empty) {
                            console.log(
                                "No documents found with matching phone."
                            );
                            return; // Exit if no documents are found
                        }

                        // If there are matching documents, update each one
                        querySnapshot.forEach((doc) => {
                            doc.ref
                                .update({
                                    avatar: url, // Assuming user.imageUrl contains the base64 string of the new avatar
                                })
                                .then(() => {
                                    console.log(
                                        "User avatar updated successfully."
                                    );
                                })
                                .catch((error) => {
                                    console.error(
                                        "Error updating avatar:",
                                        error
                                    );
                                });
                        });
                    })
                    .catch((error) => {
                        console.error("Error retrieving user:", error);
                    });
            } else {
                console.error("User not defined or missing ID.");
            }
        }
    };

    return (
        <BlurView
            intensity={80}
            tint={"dark"}
            style={{
                flex: 1,
                paddingTop: 100,
                backgroundColor: "rgba(0,0,0,0.5)",
            }}
        >
            <View style={{ alignItems: "center" }}>
                <TouchableOpacity
                    onPress={onCaptureImage}
                    style={styles.captureBtn}
                >
                    {user?.imageUrl && (
                        <Image
                            source={{ uri: user?.imageUrl }}
                            style={styles.avatar}
                        />
                    )}
                </TouchableOpacity>

                <View style={{ flexDirection: "row", gap: 6 }}>
                    {!edit && (
                        <View style={styles.editRow}>
                            <Text style={{ fontSize: 26, color: "#fff" }}>
                                {firstName} {lastName}
                            </Text>
                            <TouchableOpacity onPress={() => setEdit(true)}>
                                <Ionicons
                                    name="ellipsis-horizontal"
                                    size={24}
                                    color={"#fff"}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                    {edit && (
                        <View style={styles.editRow}>
                            <TextInput
                                placeholder="First Name"
                                value={firstName || ""}
                                onChangeText={setFirstName}
                                style={[styles.inputField]}
                            />
                            <TextInput
                                placeholder="Last Name"
                                value={lastName || ""}
                                onChangeText={setLastName}
                                style={[styles.inputField]}
                            />
                            <TouchableOpacity onPress={onSaveUser}>
                                <Ionicons
                                    name="checkmark-outline"
                                    size={24}
                                    color={"#fff"}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                <View style={{ alignItems: "center", width: "100%" }}>
                    <View
                        style={[
                            styles.actions,
                            { width: "80%", alignItems: "center" },
                        ]}
                    >
                        {!editUsername && (
                            <View
                                style={{
                                    height: 50,
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 16,
                                        color: "#fff",
                                        marginRight: 20,
                                    }}
                                >
                                    {user?.username
                                        ? user?.username
                                        : "No username yet"}{" "}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setEditUsername(true)}
                                >
                                    <Ionicons
                                        name="ellipsis-horizontal"
                                        size={24}
                                        color={"#fff"}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                        {editUsername && (
                            <View
                                style={{
                                    height: 50,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <TextInput
                                    placeholder="Username"
                                    value={username || ""}
                                    autoCapitalize="none"
                                    onChangeText={setUsername}
                                    style={[styles.inputField]}
                                />

                                <TouchableOpacity onPress={onSaveUsername}>
                                    <Ionicons
                                        name="checkmark-outline"
                                        size={24}
                                        color={"#fff"}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setEditUsername(false);
                                    }}
                                >
                                    <Ionicons
                                        name="close-outline"
                                        size={24}
                                        color={"#fff"}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                {user?.emailAddresses.map((email) => (
                    <View key={email.id} style={styles.emailRow}>
                        <Ionicons name="mail" size={24} color={"#fff"} />

                        <Text style={styles.emailText}>
                            {email.emailAddress}{" "}
                            {email.id === user.primaryEmailAddressId && (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={18}
                                    color="green"
                                />
                            )}
                        </Text>
                        <TouchableOpacity
                            onPress={() => handleSetPrimary(email.id)}
                            style={styles.primaryButton}
                        >
                            <Text>Set as Primary</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    alignContent: "center",
                }}
            >
                {editEmail ? (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.inputField, { width: "50%" }]}
                            onChangeText={setNewEmail}
                            value={newEmail}
                            placeholder="Enter new email"
                        />
                        <TouchableOpacity
                            onPress={onSaveEmail}
                            style={{ marginTop: 10 }}
                        >
                            <Ionicons
                                name="checkmark-outline"
                                size={24}
                                color={"#fff"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setEditEmail(false)}
                            style={{ marginTop: 10 }}
                        >
                            <Ionicons
                                name="close-outline"
                                size={24}
                                color={"#fff"}
                            />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => setEditEmail(true)}
                        style={{
                            height: 50,
                            width: 230,
                            backgroundColor: "white",
                            justifyContent: "center",
                            borderRadius: 30,
                            alignItems: "center",
                        }}
                    >
                        <Text>Add New Email</Text>
                    </TouchableOpacity>
                )}
            </View>
        </BlurView>
    );
};

const styles = StyleSheet.create({
    editRow: {
        flex: 1,
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.gray,
    },
    captureBtn: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.gray,
        justifyContent: "center",
        alignItems: "center",
    },
    inputField: {
        width: 140,
        height: 44,
        borderWidth: 1,
        borderColor: Colors.gray,
        borderRadius: 8,
        padding: 10,
        backgroundColor: "#fff",
    },
    actions: {
        backgroundColor: "rgba(256, 256, 256, 0.1)",
        borderRadius: 16,
        gap: 0,
        margin: 20,
    },
    btn: {
        padding: 14,
        flexDirection: "row",
        gap: 20,
    },
    emailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    emailText: {
        fontSize: 16,
        color: "white",
    },
    primaryButton: {
        padding: 8,
        backgroundColor: "white",
        borderRadius: 10,
    },
    addButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: Colors.primary,
    },
    inputContainer: {
        flexDirection: "row",
        marginTop: 10,
        gap: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
    },
    saveButton: {
        padding: 10,
        backgroundColor: Colors.primary,
    },
    cancelButton: {
        padding: 10,
        backgroundColor: Colors.background,
    },
});
export default Page;
