import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { COLORS } from "../../constants/theme";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/config";
import { useAuth } from "../../context/AuthContext";

function formatDateVN(dateString) {
  if (!dateString) return "Không rõ";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const SecurityScreen = () => {
  const { user, updateUserData, fetchUserProfile } = useAuth();

  // Modal states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Change password form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingChange, setLoadingChange] = useState(false);

  // 2FA
  const [otp, setOtp] = useState("");
  const [loading2FA, setLoading2FA] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Feedback
  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: "OK" }]);
  };



  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  }, [fetchUserProfile]);

  // Change password handler
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showAlert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setLoadingChange(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.post(
        `${API_URL}/account/auth/change-password`,
        {
          OldPassword: oldPassword,
          NewPassword: newPassword,
          ConfirmPassword: confirmPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert("Thành công", res.data.message || "Đổi mật khẩu thành công");
      setShowChangePassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await fetchUserProfile();
    } catch (err) {
      showAlert(
        "Lỗi",
        err.response?.data?.message ||
          "Đổi mật khẩu không thành công, vui lòng kiểm tra lại thông tin"
      );
    }
    setLoadingChange(false);
  };

  // Send OTP handler
  const handleSendOtp = async () => {
    setLoading2FA(true);
    setOtpError("");
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.post(
        `${API_URL}/account/auth/send-2fa-otp`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpSent(true);
      showAlert("Thành công", "Đã gửi mã xác thực đến email");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Không gửi được mã xác thực");
    }
    setLoading2FA(false);
  };

  // Enable 2FA handler
  const handleEnable2FA = async () => {
    if (!otp) {
      setOtpError("Vui lòng nhập mã xác thực");
      return;
    }
    setLoading2FA(true);
    setOtpError("");
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.post(
        `${API_URL}/account/auth/enable-2fa`,
        { token: otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      showAlert(
        "Thành công",
        res.data.message || "Bật bảo mật 2 lớp thành công"
      );
      setShow2FAModal(false);
      setOtp("");
      setOtpSent(false);
      await fetchUserProfile();
    } catch (err) {
      setOtpError(err.response?.data?.message || "Không gửi được mã xác thực");
    }
    setLoading2FA(false);
  };

  // Reset 2FA modal state
  const close2FAModal = () => {
    setShow2FAModal(false);
    setOtp("");
    setOtpSent(false);
    setOtpError("");
  };

  // Disable 2FA handler
  const handleDisable2FA = async () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn tắt bảo mật 2 lớp?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Tắt",
          style: "destructive",
          onPress: async () => {
            setLoading2FA(true);
            try {
              const token = await AsyncStorage.getItem("authToken");
              await axios.post(
                `${API_URL}/account/auth/disable-2fa`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              showAlert("Thành công", "Đã tắt bảo mật 2 lớp");
              await fetchUserProfile(); // Refresh user context
            } catch (err) {
              showAlert(
                "Lỗi",
                err.response?.data?.message || "Không tắt được bảo mật 2 lớp"
              );
            }
            setLoading2FA(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Bảo mật tài khoản</Text>

        {/* Last password change info */}
        <View style={styles.infoCard}>
          <Ionicons
            name="time-outline"
            size={28}
            color={COLORS.primary}
            style={{ marginRight: 10 }}
          />
          <View>
            <Text style={styles.infoLabel}>Lần đổi mật khẩu gần nhất</Text>
            <Text style={styles.infoValue}>
              {user?.passwordChangeAt
                ? formatDateVN(user.passwordChangeAt)
                : "Chưa từng đổi mật khẩu"}
            </Text>
          </View>
        </View>

        {/* 2FA Status */}
        <View style={styles.infoCard}>
          <Ionicons
            name={user?.twoFactor ? "shield-checkmark" : "shield-outline"}
            size={28}
            color={user?.twoFactor ? "#2ecc40" : "#ff4136"}
            style={{ marginRight: 10 }}
          />
          <View>
            <Text style={styles.infoLabel}>Bảo mật 2 lớp</Text>
            <Text style={[
              styles.infoValue,
              { color: user?.twoFactor ? "#2ecc40" : "#ff4136" }
            ]}>
              {user?.twoFactor ? "Đang bật" : "Đang tắt"}
            </Text>
          </View>
        </View>

        {/* Change password button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowChangePassword(true)}
        >
          <Ionicons name="lock-closed-outline" size={22} color="#fff" />
          <Text style={styles.buttonText}>Đổi mật khẩu</Text>
        </TouchableOpacity>

        {/* 2FA Toggle Button */}
        {user?.twoFactor ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#ff4136" }]}
            onPress={handleDisable2FA}
            disabled={loading2FA}
          >
            <Ionicons name="shield-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}>Tắt bảo mật 2 lớp</Text>
            {loading2FA && <ActivityIndicator color="#fff" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShow2FAModal(true)}
          >
            <Ionicons name="shield-checkmark-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}>Bật bảo mật 2 lớp</Text>
          </TouchableOpacity>
        )}

        {/* Change Password Modal */}
        <Modal visible={showChangePassword} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu cũ"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu mới"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowChangePassword(false)}
                >
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleChangePassword}
                  disabled={loadingChange}
                >
                  {loadingChange ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitText}>Xác nhận</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 2FA Modal */}
        <Modal visible={show2FAModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Bật bảo mật 2 lớp</Text>
              <Text style={styles.modalDesc}>
                Nhấn nút bên dưới để nhận mã xác thực qua email.
              </Text>
              <TouchableOpacity
                style={[
                  styles.sendOtpBtn,
                  otpSent && { backgroundColor: COLORS.border },
                ]}
                onPress={handleSendOtp}
                disabled={loading2FA || otpSent}
              >
                {loading2FA ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendOtpText}>
                    {otpSent ? "Đã gửi mã" : "Gửi mã xác thực"}
                  </Text>
                )}
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Mã xác thực"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                editable={otpSent}
              />
              {otpError ? <Text style={styles.otpError}>{otpError}</Text> : null}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={close2FAModal}
                >
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    !otpSent && { backgroundColor: COLORS.border },
                  ]}
                  onPress={handleEnable2FA}
                  disabled={loading2FA || !otpSent}
                >
                  {loading2FA ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitText}>Xác nhận</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
    paddingTop: 24,
    backgroundColor: COLORS.background.primary,
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 28,
    alignSelf: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 28,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoLabel: { color: COLORS.text.secondary, fontSize: 14 },
  infoValue: {
    color: COLORS.text.primary,
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 2,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 12,
  },
  modalDesc: { color: COLORS.text.secondary, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  cancelBtn: { marginRight: 16, paddingVertical: 10, paddingHorizontal: 18 },
  cancelText: { color: COLORS.text.secondary, fontWeight: "bold" },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  submitText: { color: "#fff", fontWeight: "bold" },
  sendOtpBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  sendOtpText: { color: "#fff", fontWeight: "bold" },
  otpError: { color: COLORS.error, marginBottom: 8, fontSize: 14 },
});

export default SecurityScreen;
