import { Layout } from 'antd';
const { Footer } = Layout;





export default function FooterPage() {

    const footerStyle = {
        textAlign: 'center',
        color: 'black',
        backgroundColor: 'pink',
        padding: '12px',
    };

    return (
        <Footer style={footerStyle}>Footer</Footer>
    )
}