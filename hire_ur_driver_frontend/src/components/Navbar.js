// src/components/Navbar.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useScrollTrigger,
  Slide
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import DirectionsCar from "@mui/icons-material/DirectionsCar";

const HideOnScroll = ({ children }) => {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <HideOnScroll>
      <AppBar position="sticky" sx={{ 
        backgroundColor: "white", 
        color: "black",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <Toolbar sx={{ 
          maxWidth: 1280, 
          width: "100%", 
          mx: "auto",
          py: 1
        }}>
          {/* Logo with Ola-style branding */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            mr: 3,
            "&:hover": { transform: "scale(1.02)" }
          }}>
            <DirectionsCar sx={{ 
              color: "primary.main", 
              fontSize: 32,
              mr: 1 
            }}/>
            <Typography variant="h5" sx={{ 
              fontWeight: "bold",
              background: "linear-gradient(to right, #2563eb, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              HireUrDriver
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ 
            display: { xs: "none", md: "flex" }, 
            flexGrow: 1,
            gap: 2
          }}>
            <Button 
              component={Link} 
              to="/" 
              sx={{ 
                color: "black",
                fontWeight: 600,
                "&:hover": { color: "primary.main" }
              }}
            >
              Home
            </Button>
            <Button 
              component={Link} 
              to="/drive" 
              sx={{ 
                color: "black",
                fontWeight: 600,
                "&:hover": { color: "primary.main" }
              }}
            >
              Drive With Us
            </Button>
            <Button 
              component={Link} 
              to="/offers" 
              sx={{ 
                color: "black",
                fontWeight: 600,
                "&:hover": { color: "primary.main" }
              }}
            >
              Offers
            </Button>
          </Box>

          {/* Mobile Menu Button */}
          <Box sx={{ 
            display: { xs: "flex", md: "none" }, 
            flexGrow: 1,
            justifyContent: "flex-end"
          }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  width: 200,
                  mt: 5,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)"
                }
              }}
            >
              <MenuItem onClick={handleClose} component={Link} to="/">Home</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/drive">Drive With Us</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/offers">Offers</MenuItem>
              <Divider />
              <MenuItem onClick={handleClose} component={Link} to="/login">Login</MenuItem>
            </Menu>
          </Box>

          {/* Auth Buttons */}
          <Box sx={{ 
            display: { xs: "none", md: "flex" }, 
            alignItems: "center",
            gap: 1
          }}>
            <Button 
              component={Link} 
              to="/login" 
              variant="outlined" 
              sx={{ 
                borderRadius: 50,
                px: 3,
                borderWidth: 2,
                "&:hover": { borderWidth: 2 }
              }}
            >
              Login
            </Button>
            <Button 
              component={Link} 
              to="/register" 
              variant="contained" 
              sx={{ 
                borderRadius: 50,
                px: 3,
                boxShadow: "none",
                "&:hover": { boxShadow: "none" }
              }}
            >
              Sign Up
            </Button>
          </Box>

          {/* Mobile Profile Icon */}
          <IconButton sx={{ display: { xs: "flex", md: "none" } }}>
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar;