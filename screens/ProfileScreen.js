import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView,
  Alert, ActivityIndicator, Dimensions
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [coverURL, setCoverURL] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigation = useNavigation();
  const user = auth().currentUser;

  useEffect(() => {
    if (user) loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const docSnap = await firestore().collection('users').doc(user.uid).get();
      if (docSnap.exists) {
        const data = docSnap.data();
        setUserData(data);
        setPhotoURL(data.photoURL || null);
        setCoverURL(data.coverURL || null);
      }
    } catch (err) {
      Alert.alert('Hata', 'Kullanıcı verileri alınamadı.');
    }
  };

  const pickImage = (type) => {
    Alert.alert(
      'Fotoğraf Seçimi',
      'Fotoğrafı nasıl yüklemek istersiniz?',
      [
        {
          text: 'Kamera',
          onPress: () => launchCamera({ mediaType: 'photo' }, (res) => {
            if (!res.didCancel && !res.errorCode) uploadImage(res.assets[0].uri, type);
          }),
        },
        {
          text: 'Galeri',
          onPress: () => launchImageLibrary({ mediaType: 'photo' }, (res) => {
            if (!res.didCancel && !res.errorCode) uploadImage(res.assets[0].uri, type);
          }),
        },
        { text: 'İptal', style: 'cancel' },
      ]
    );
  };

  const uploadImage = async (uri, type) => {
    try {
      setUploading(true);
      const filename = `${type}Images/${user.uid}`;
      const ref = storage().ref(filename);
      await ref.putFile(uri);
      const url = await ref.getDownloadURL();
      await firestore().collection('users').doc(user.uid).update({ [`${type}URL`]: url });
      type === 'cover' ? setCoverURL(url) : setPhotoURL(url);
    } catch (err) {
      Alert.alert('Yükleme Hatası', `${type} fotoğrafı yüklenemedi.`);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch {
      Alert.alert('Çıkış Hatası', 'Çıkış yapılamadı.');
    }
  };

  const goToEditProfile = () => navigation.navigate('EditProfile');

  if (!userData) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00cc66" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.coverContainer}>
        <Image source={{ uri: coverURL || 'https://via.placeholder.com/800x300.png?text=Cover+Photo' }} style={styles.coverImage} />
        <TouchableOpacity style={styles.coverCamera} onPress={() => pickImage('cover')}>
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <TouchableOpacity onPress={() => pickImage('photo')}>
            <Image source={{ uri: photoURL || 'https://i.pravatar.cc/150?img=8' }} style={styles.avatar} />
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.username}>{userData.displayName || 'User'}</Text>
        <Text style={styles.bio}>Add a bio to your profile</Text>
      </View>

      <View style={styles.optionList}>
        <Option icon={<Feather name="edit" size={20} color="#fff" />} label="Edit profile" onPress={goToEditProfile} />
        <Option icon={<Feather name="shield" size={20} color="#fff" />} label="Security" />
        <Option icon={<Feather name="bell" size={20} color="#fff" />} label="Notifications" />
        <Option icon={<Feather name="log-out" size={20} color="#fff" />} label="Logout" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
}

function Option({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.optionContainer} onPress={onPress}>
      <View style={styles.optionInner}>
        {icon}
        <Text style={styles.optionLabel}>{label}</Text>
        <Entypo name="chevron-right" size={20} color="#999" style={{ marginLeft: 'auto' }} />
      </View>
    </TouchableOpacity>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0d0d' },
  coverContainer: { position: 'relative', width: '100%', height: 160, backgroundColor: '#222' },
  coverImage: { width: '100%', height: '100%' },
  coverCamera: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: '#0008', padding: 8, borderRadius: 20,
  },
  header: { alignItems: 'center', marginTop: -50, paddingBottom: 20 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#0d0d0d' },
  cameraIcon: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#00cc66', padding: 6, borderRadius: 12,
  },
  username: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  bio: { color: '#aaa', fontSize: 14, marginTop: 4 },
  optionList: { paddingHorizontal: 20, marginTop: 20 },
  optionContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  optionInner: { flexDirection: 'row', alignItems: 'center' },
  optionLabel: { color: '#fff', fontSize: 16, marginLeft: 12 },
});
