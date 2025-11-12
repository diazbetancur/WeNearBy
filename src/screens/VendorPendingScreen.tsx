/**
 * VendorPendingScreen
 * 
 * Screen shown to users with status='pending'
 * Displays message that their vendor request is under review.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRole } from '../context/RoleContextProvider';

export default function VendorPendingScreen() {
  const { vendorProfile } = useRole();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⏳</Text>
      </View>

      <Text style={styles.title}>Solicitud en Revisión</Text>
      <Text style={styles.subtitle}>
        Tu solicitud para ser vendedor está siendo revisada por nuestro equipo
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Información de tu Solicitud</Text>
        {vendorProfile && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre Legal:</Text>
              <Text style={styles.infoValue}>{vendorProfile.legalName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{vendorProfile.contactEmail}</Text>
            </View>
            {vendorProfile.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Teléfono:</Text>
                <Text style={styles.infoValue}>{vendorProfile.phone}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado:</Text>
              <Text style={[styles.infoValue, styles.statusPending]}>Pendiente</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>⏰ ¿Cuánto tiempo tarda?</Text>
        <Text style={styles.infoText}>
          La revisión de tu solicitud puede tomar entre 1 y 3 días hábiles. Te notificaremos por
          email cuando sea aprobada.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📧 ¿Necesitas ayuda?</Text>
        <Text style={styles.infoText}>
          Si tienes alguna pregunta sobre tu solicitud, contáctanos a:{'\n\n'}
          soporte@wenearby.com
        </Text>
      </View>

      <View style={styles.timelineCard}>
        <Text style={styles.timelineTitle}>📍 Proceso de Aprobación</Text>

        <View style={styles.timelineItem}>
          <View style={[styles.timelineDot, styles.timelineDotCompleted]} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineStepTitle}>1. Solicitud Enviada ✅</Text>
            <Text style={styles.timelineStepDesc}>Has completado el formulario</Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <View style={[styles.timelineDot, styles.timelineDotActive]} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineStepTitle}>2. En Revisión ⏳</Text>
            <Text style={styles.timelineStepDesc}>
              Nuestro equipo está verificando tu información
            </Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineStepTitle}>3. Aprobación</Text>
            <Text style={styles.timelineStepDesc}>Recibirás acceso al panel de vendedor</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'right',
  },
  statusPending: {
    color: '#FF9800',
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F57C00',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22,
  },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginRight: 16,
    marginTop: 4,
  },
  timelineDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  timelineDotActive: {
    backgroundColor: '#FF9800',
  },
  timelineContent: {
    flex: 1,
  },
  timelineStepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  timelineStepDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
