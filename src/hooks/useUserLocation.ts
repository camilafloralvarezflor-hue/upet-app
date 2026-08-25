import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

interface UserLocationState {
  coords: { lat: number; lng: number } | null;
  status: 'loading' | 'granted' | 'denied';
}

export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>({ coords: null, status: 'loading' });

  const request = async () => {
    setState({ coords: null, status: 'loading' });
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setState({ coords: null, status: 'denied' });
      return;
    }

    const position = await Location.getCurrentPositionAsync({});
    setState({
      coords: { lat: position.coords.latitude, lng: position.coords.longitude },
      status: 'granted',
    });
  };

  useEffect(() => {
    request();
  }, []);

  return { ...state, retry: request };
}
