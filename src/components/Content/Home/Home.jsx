import { useState } from 'react';
import {
    SearchOutlined,
} from '@ant-design/icons';

const imageWrapperStyle = {
    position: 'relative',
    maxWidth: '100%',
};

const imageStyle = {
    paddingRight:'80px',
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
};
const inputContainerStyle = {
    position: 'absolute',
    top: '8%',
    left: '20%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    borderRadius: '8px',
    overflow: 'hidden',
    width: '400px', // фиксированная ширина для ровного внешнего вида
    backgroundColor: '#121212',
    border: '1px solid #333',
};


const inputStyle = {
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#121212',
    color: 'grey',
    width: '100%',
};


const buttonStyle = {
    padding: '8px 16px',
    border: '1px solid #121212',
    backgroundColor: '#121212',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
};

const ImageCenter = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    paddingTop: '50px',
};

export default function Home() {
    const [searchValue, setSearchValue] = useState('');

    const handleSearch = () => {
        console.log('custom', searchValue);
    };

    return (
        <div>
            <div style={ImageCenter}>
                <div style={imageWrapperStyle}>
                    <img
                        src="src/assets/fon.png"
                        alt="SoundBloom"
                        style={imageStyle}
                    />

                    <div style={inputContainerStyle}>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search For Musics, Artist, ..."
                            style={inputStyle}
                        />
                        <button onClick={handleSearch} style={buttonStyle}>
                            <SearchOutlined/>
                        </button>
                    </div>
                </div>
            </div>
            <div>
                content
            </div>
            <div>
                content
            </div>
            <div>
                content
            </div>
            <div>
                content
            </div>
            <div>
                content
            </div>
        </div>
    );
}
