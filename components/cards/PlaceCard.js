import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import { formatPrice } from "../../utils/formatPrice";
import FavouriteButton from "../buttons/FavouriteButton";

// Get device width to make cards responsive
const { width } = Dimensions.get("window");

const PlaceCard = ({
  item,
  variant = "horizontal",
  onPress,
  imageStyle = {},
  style = {},
  updatePlaceFavourite,
}) => {
  const navigation = useNavigation();

  if (!item) {
    return null; // Return null if item is undefined
  }

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    } else {
      navigation.navigate('PlaceDetails', { 
        id: item.id,
        onToggleFavourite: updatePlaceFavourite 
      });
    }
  };

  const getCardStyle = () => {
    switch (variant) {
      case "popular":
        return {
          containerStyle: styles.popularContainer,
          imageStyle: styles.popularImage,
          infoStyle: styles.popularInfo,
        };
      case "vertical":
        return {
          containerStyle: styles.verticalContainer,
          imageStyle: styles.verticalImage,
          infoStyle: styles.verticalInfo,
        };
      case "horizontal-slim":
        return {
          containerStyle: styles.horizontalSlimContainer,
          imageStyle: styles.horizontalSlimImage,
          infoStyle: styles.horizontalSlimInfo,
        };
      case "horizontal":
      default:
        return {
          containerStyle: styles.horizontalContainer,
          imageStyle: styles.horizontalImage,
          infoStyle: styles.horizontalInfo,
        };
    }
  };

  const {
    containerStyle,
    imageStyle: variantImageStyle,
    infoStyle,
  } = getCardStyle();
  const imageUrl =
    item.imageUrl ||
    (item.images && item.images.length > 0 ? item.images[0].imageUrl : null);

  // Calculate discounted price (for horizontal-slim variant)
  const originalPrice = Math.round(item.price * 1.2);

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={[variantImageStyle, imageStyle]}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favoriteButton}>
          <FavouriteButton
            placeId={item.id}
            initialIsFavourite={item.isFavourite}
            onToggle={(newState) =>
              updatePlaceFavourite && updatePlaceFavourite(item.id, newState)
            }
          />
        </TouchableOpacity>
      </View>

      <View style={infoStyle}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name || ""}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {item.location || item.address || ""}
        </Text>

        {variant === "horizontal-slim" ? (
          <View style={styles.slimBottomContainer}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}>
                {(item.rating || 0).toFixed(1)} ({item.numOfRating || 0})
              </Text>
            </View>
            <View style={styles.priceRowContainer}>
              <Text style={styles.oldPrice}>${originalPrice}</Text>
              <Text style={styles.newPrice}>${item.price}</Text>
            </View>
          </View>
        ) : (
          // Standard price/rating display for other variants
          <View style={styles.priceRatingContainer}>
            <Text style={styles.price}>
              <Text style={styles.priceValue}>
                {formatPrice(item.price) || 0}
              </Text>
              <Text style={styles.priceUnit}> VNĐ/ ngày</Text>
            </Text>

            {item.rating !== undefined && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.rating}>
                  {(item.rating || 0).toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Popular card styles (large card)
  popularContainer: {
    width: width * 0.6, // Make width shorter (was 0.65)
    height: 250, // Make length longer (was 220)
    marginRight: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    overflow: "hidden",
    backgroundColor: "white",
    ...SHADOWS.medium,
  },
  popularImage: {
    width: "100%",
    height: 170, // Increased from 150
  },
  popularInfo: {
    padding: SIZES.padding.small,
    height: 80, // Fixed height for info section
    justifyContent: "space-between", // Distribute content evenly
  },

  // Horizontal card styles (with image on left)
  horizontalContainer: {
    flexDirection: "row",
    width: "100%",
    height: 100,
    marginBottom: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    overflow: "hidden",
    backgroundColor: "white",
    ...SHADOWS.small,
  },
  horizontalImage: {
    width: 100,
    height: "100%",
  },
  horizontalInfo: {
    flex: 1,
    padding: SIZES.padding.small,
    justifyContent: "space-between",
  },

  // Horizontal-slim card styles (for recommendations)
  horizontalSlimContainer: {
    flexDirection: "row",
    width: width * 0.7,
    height: 100,
    marginRight: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    overflow: "hidden",
    backgroundColor: COLORS.background.secondary,
    ...SHADOWS.small,
  },
  horizontalSlimImage: {
    width: 100,
    height: 100,
  },
  horizontalSlimInfo: {
    flex: 1,
    padding: SIZES.padding.medium,
    justifyContent: "space-between",
  },

  // Vertical card styles (compact)
  verticalContainer: {
    width: width * 0.4,
    height: 180,
    marginRight: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    overflow: "hidden",
    backgroundColor: "white",
    ...SHADOWS.small,
  },
  verticalImage: {
    width: "100%",
    height: 100,
  },
  verticalInfo: {
    padding: SIZES.padding.small,
    height: 80,
    justifyContent: "space-between",
  },

  // Common styles
  imageContainer: {
    position: "relative",
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  priceRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4, // Added margin to move away from the location text
  },
  price: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 2,
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  // Styles specific to the horizontal-slim variant
  slimBottomContainer: {
    marginTop: 4,
  },
  priceRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  oldPrice: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textDecorationLine: "line-through",
    marginRight: 6,
  },
  newPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
});

export default PlaceCard;
