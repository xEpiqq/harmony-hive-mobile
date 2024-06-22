import { Image } from "react-native";

export default function CherryBlossomBackground({seed, className}) {
    const images = [
        require('../../public/cherryblossom.png'),
        require('../../public/cherryblossom2.png'),
        require('../../public/cherryblossom3.png'),
        require('../../public/cherryblossom4.png'),
        require('../../public/cherryblossom5.png'),
        require('../../public/cherryblossom6.png'),
        require('../../public/cherryblossom7.png'),
        require('../../public/cherryblossom8.png'),
        require('../../public/cherryblossom9.png'),
        require('../../public/cherryblossom10.png'),
        require('../../public/cherryblossom11.png'),
        require('../../public/cherryblossom12.png'),
        require('../../public/cherryblossom13.png'),
        require('../../public/cherryblossom14.png'),
        require('../../public/cherryblossom15.png'),
    ];

    return (
        <Image
            source={images[seed % images.length]}
            className={className}
        />
    );
}