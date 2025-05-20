import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addFavourite, removeFavourite, getFavouritesByUser } from '../../api/favourites';
import { COLORS } from '../../constants/theme';

const FavouriteButton = ({ placeId, initialIsFavourite = false, size = 24, style = {}, onToggle }) => {
  const [isFavourite, setIsFavourite] = useState(initialIsFavourite);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFavourite(initialIsFavourite);
  }, [initialIsFavourite]);

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isFavourite) {
        await removeFavourite({ placeId });
        setIsFavourite(false);
        onToggle && onToggle(false);
      } else {
        console.log
        await addFavourite({ placeId });
        setIsFavourite(true);
        onToggle && onToggle(true);
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={style}>
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <Ionicons
          name={isFavourite ? 'heart' : 'heart-outline'}
          size={size}
          color={isFavourite ? '#FF5A5F' : 'white'}
        />
      )}
    </TouchableOpacity>
  );
};

export default FavouriteButton;
