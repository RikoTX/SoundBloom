import { Layout } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import CustomButton from "../Button/Button";
import {
  HomeOutlined,
  SearchOutlined,
  StarOutlined,
  UserOutlined,
  HeartOutlined,
  ProfileOutlined,
  SettingOutlined,
  LogoutOutlined,
  RightOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Sider: AntSider } = Layout;

const siderStyle = {
  backgroundColor: "#181818",
  borderRight: "2px solid #cb0094",
  boxShadow: "1px 0 10px #cb0094",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 1000,
};

const contentWrapperStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "40px 20px 0 20px",
  overflowY: "auto",
};

const labelStyle = {
  color: "#cb0094",
  fontSize: "15px",
  marginBottom: "5px",
  marginTop: "20px",
};

const menuStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "20px",
  width: "100%",
  alignItems: "center",
};

export default function SiderMenu({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const createButton = (label, icon, route, activePaths = [route]) => (
    <CustomButton
      active={activePaths.some((path) => location.pathname.startsWith(path))}
      onClick={() => navigate(route)}
    >
      {icon} {isOpen && label}
    </CustomButton>
  );

  return (
    <motion.div
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ duration: 0.3 }}
      style={{ ...siderStyle, width: 250 }}
    >
      <div style={{ position: "absolute", top: 10, right: -50, zIndex: 1001 }}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            background: "#2a2a2aff",
            border: "none",
            borderRadius: "5px",
            color: "white",
            padding: "12px",
            cursor: "pointer",
          }}
        >
          {isOpen ? <LeftOutlined /> : <RightOutlined />}
        </button>
      </div>

      <div style={contentWrapperStyle}>
        {isOpen && (
          <img
            src={`${import.meta.env.BASE_URL}soundBloom.png`}
            alt="SoundBloom"
            style={{
              maxWidth: "90%",
              alignSelf: "center",
              marginBottom: "20px",
            }}
          />
        )}

        <label style={labelStyle}>Menu</label>
        <div style={menuStyle}>
          {createButton("Home", <HomeOutlined />, "/Home", [
            "/Home",
            ...(location.pathname.startsWith("/PageAlbums") && from === "home"
              ? ["/PageAlbums"]
              : []),
          ])}

          {createButton("Search", <SearchOutlined />, "/Search")}
          {createButton("Popular", <StarOutlined />, "/Popular", [
            "/Popular",
            ...(location.pathname.startsWith("/PageAlbums") && from === "popular"
              ? ["/PageAlbums"]
              : []),
          ])}

          {createButton("Artist", <UserOutlined />, "/Artist", [
            "/Artist",
            "/PageArtists",
          ])}
        </div>

        <label style={labelStyle}>Playlist and favorite</label>
        <div style={menuStyle}>
          {createButton("Liked Songs", <HeartOutlined />, "/LikedSongs")}
          {createButton("Playlist", <ProfileOutlined />, "/Playlist")}
        </div>

        <label style={labelStyle}>General</label>
        <div style={menuStyle}>
          {createButton("Settings", <SettingOutlined />, "/Settings")}
          {createButton("Logout", <LogoutOutlined />, "/Logout")}
        </div>
      </div>
    </motion.div>
  );
}
