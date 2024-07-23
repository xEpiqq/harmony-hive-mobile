import { Image } from "react-native";
import { CherryBlossoms } from "../../assets/images";

export default function CherryBlossomBackground({seed, className}) {
    const images = CherryBlossoms;

    return (
        <Image
            source={images[seed % images.length]}
            className={className}
        />
    );
}