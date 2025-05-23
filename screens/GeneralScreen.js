import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth } from '../firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function GeneralScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [courtNumber, setCourtNumber] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const user = auth.currentUser;

  // QR koddan dönülürse modalı otomatik aç
  useEffect(() => {
    if (route.params?.scannedQR) {
      setModalType('qr');
      setModalVisible(true);
    }
  }, [route.params?.scannedQR]);

  const handleFabPress = () => {
    Alert.alert('Yeni Video Kaydı', 'Lütfen bir yöntem seçin', [
      { text: '📷 QR Kodunu Tara', onPress: handleQRCodeFlow },
      {
        text: '🎾 Kort Numarası Gir',
        onPress: () => {
          setModalType('manual');
          setModalVisible(true);
        },
      },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const handleQRCodeFlow = () => {
    navigation.navigate('QRCodeScanner');
  };

  const handleConfirm = () => {
    if (modalType === 'manual' && !courtNumber.trim()) {
      Alert.alert('Eksik Bilgi', 'Kort numarasını girmelisiniz.');
      return;
    }
    setModalVisible(false);
    setCourtNumber('');
    Alert.alert('✔️ Başarılı', 'Oturum başarıyla oluşturuldu.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>🎾 Tenis Video Analizi</Text>

      <TouchableOpacity style={styles.card} onPress={handleFabPress}>
        <Text style={styles.cardTitle}>📋 Nasıl Çalışır?</Text>
        <Text style={styles.cardText}>
          Bu uygulama kortta oynanan tenis videolarını analiz eder. Aşağıdaki adımları izleyerek yeni bir oturum başlatabilirsin:
        </Text>
        <Text style={styles.bullet}>• QR kodunu tarayarak analiz başlat</Text>
        <Text style={styles.bullet}>• Manuel olarak kort bilgisi ve saat gir</Text>
        <Text style={styles.bullet}>• Sistem video verilerini işler ve sonuçları sunar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>📊 Önceki Oturumlar</Text>
        <Text style={styles.cardText}>Bu alanda gelecekteki analiz geçmişini görebileceksin.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>💡 İpucu</Text>
        <Text style={styles.cardText}>
          Daha iyi sonuçlar için kamerayı sabit tut ve kortun tamamını çekecek şekilde konumlandır.
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}
            >
              {modalType === 'manual' && (
                <>
                  <Text style={styles.modalTitle}>Kort Numarası</Text>
                  <TextInput
                    placeholder="Örn: 3"
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                    style={styles.input}
                    value={courtNumber}
                    onChangeText={setCourtNumber}
                  />
                </>
              )}

              <Text style={styles.modalLabel}>Başlangıç Saati</Text>
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowStartPicker(true)}>
                <Text style={styles.timeText}>
                  {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              {showStartPicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  is24Hour
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selected) => {
                    setShowStartPicker(false);
                    if (selected) setStartTime(selected);
                  }}
                />
              )}

              <Text style={styles.modalLabel}>Bitiş Saati</Text>
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowEndPicker(true)}>
                <Text style={styles.timeText}>
                  {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              {showEndPicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  is24Hour
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selected) => {
                    setShowEndPicker(false);
                    if (selected) setEndTime(selected);
                  }}
                />
              )}

              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.buttonText}>Oturumu Başlat</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <TouchableOpacity style={styles.fabButton} onPress={handleFabPress}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16, paddingTop: 40 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 16, paddingLeft: 4 },
  card: { backgroundColor: '#1e1e1e', padding: 16, borderRadius: 14, marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#fff', marginBottom: 8 },
  cardText: { fontSize: 14, color: '#aaa' },
  bullet: { color: '#ccc', fontSize: 14, marginTop: 6, paddingLeft: 8 },
  fabButton: { position: 'absolute', right: 24, bottom: 30, backgroundColor: '#00d26a', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: '#1e1e1e', borderRadius: 14, padding: 20, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  input: { backgroundColor: '#2c2c2c', padding: 10, borderRadius: 8, color: '#fff', marginBottom: 12 },
  modalLabel: { color: '#ccc', marginTop: 10, marginBottom: 4 },
  timeButton: { backgroundColor: '#2c2c2c', padding: 10, borderRadius: 8, alignItems: 'center' },
  timeText: { color: '#fff', fontSize: 16 },
  confirmButton: { marginTop: 20, marginBottom: 20, backgroundColor: '#00d26a', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
