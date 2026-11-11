<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFormat } from '../../application/use-format.js';
import useIamStore from '../../../iam/application/iam.store.js';
import { memberRoles } from '../../domain/permissions.js';
const props = defineProps({ room: { type: Object, required: true }, dates: Object });
const { t } = useI18n(), { money, number } = useFormat(), store = useIamStore();
const canReserve = computed(() => memberRoles.includes(store.session?.role) && props.room.isBookable !== false);
</script>
<template><article class="card">
  <h2>{{ room.hotelName }}</h2><h3>{{ room.roomTypeName }}</h3>
  <p>{{ room.district }}<template v-if="room.city"> · {{ room.city }}</template></p>
  <p><strong>{{ money(room.nightlyPrice, room.currency) }}</strong> / {{ t('rooms.night') }}</p>
  <p v-if="room.stayTotal != null">{{ t('fields.totalAmount') }}: {{ money(room.stayTotal, room.currency) }}</p>
  <p>{{ t('fields.capacity') }}: {{ number(room.capacity) }}</p>
  <p v-if="room.areaM2 != null">{{ number(room.areaM2) }} m²</p><p v-if="room.bedSummary">{{ room.bedSummary }}</p>
  <p v-if="room.amenities?.length">{{ room.amenities.join(' · ') }}</p>
  <p v-if="room.hasVr">{{ t('rooms.hasVr') }}</p>
  <p v-if="room.recommendationReason">{{ room.recommendationReason }}</p>
  <p v-if="room.isBookable === false">{{ t('rooms.unavailable') }}</p>
  <router-link class="button secondary explore-link" :to="{ name: 'exploreRoom', params: { roomId: room.roomId } }">{{ t('nav.explore') }}</router-link>
  <router-link v-if="canReserve" class="button" :to="{ name: 'bookingNew', query: { roomId: room.roomId, ...dates } }">{{ t('bookings.reserve') }}</router-link>
  <router-link v-else-if="!store.isSignedIn && room.isBookable !== false" to="/auth/login">{{ t('rooms.loginToBook') }}</router-link>
</article></template>
