import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { scanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { runOnJS } from 'react-native-reanimated';

export default function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
    Camera.requestCameraPermission().then(permission => {
      setHasPermission(permission === 'authorized');
    });
  }, []);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const barcodes = scanBarcodes(frame, [BarcodeFormat.QR_CODE]);
    if (barcodes.length > 0) {
      runOnJS(setScannedData)(barcodes[0].displayValue);
    }
  }, []);

  useEffect(() => {
    if (scannedData) {
      Alert.alert("QR Kodu Okundu", scannedData);
    }
  }, [scannedData]);

  if (!device || !hasPermission) {
    return <Text>Loading camera...</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
