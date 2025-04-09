// src/pages/AdminDashboard.js
import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Tabs, 
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Badge
} from "@mui/material";
import {
  PeopleAlt,
  DirectionsCar,
  BarChart,
  Notifications,
  Mail,
  Settings,
  ArrowDropDown,
  Search
} from "@mui/icons-material";

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState(3);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Sample data
  const recentUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "User", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Driver", status: "Pending" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "User", status: "Active" },
  ];

  const stats = [
    { title: "Total Users", value: "1,284", icon: <PeopleAlt fontSize="large" />, color: "#4e73df" },
    { title: "Active Drivers", value: "342", icon: <DirectionsCar fontSize="large" />, color: "#1cc88a" },
    { title: "Bookings Today", value: "126", icon: <BarChart fontSize="large" />, color: "#f6c23e" },
    { title: "Revenue", value: "$8,542", icon: <BarChart fontSize="large" />, color: "#e74a3b" },
  ];

  return (
    <Box sx={{ backgroundColor: "#f8f9fc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ 
        backgroundColor: "white", 
        boxShadow: "0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)",
        py: 2,
        px: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: "bold",
          color: "#5a5c69",
          display: "flex",
          alignItems: "center",
          gap: 1
        }}>
          <DirectionsCar sx={{ color: "#4e73df" }} />
          Admin Dashboard
        </Typography>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton>
            <Badge badgeContent={notifications} color="error">
              <Notifications sx={{ color: "#d1d3e2" }} />
            </Badge>
          </IconButton>
          <IconButton>
            <Mail sx={{ color: "#d1d3e2" }} />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 40, height: 40 }}>A</Avatar>
            <ArrowDropDown sx={{ color: "#b7b9cc" }} />
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                borderLeft: `0.25rem solid ${stat.color}`,
                borderRadius: "0.35rem"
              }}>
                <CardContent>
                  <Box sx={{ 
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: stat.color }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      backgroundColor: `${stat.color}20`,
                      borderRadius: "50%",
                      width: 50,
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tabs Section */}
        <Paper sx={{ mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": { fontWeight: 600 },
              "& .Mui-selected": { color: "#4e73df !important" }
            }}
          >
            <Tab label="Overview" />
            <Tab label="Users" />
            <Tab label="Drivers" />
            <Tab label="Bookings" />
            <Tab label="Reports" />
          </Tabs>
        </Paper>

        {/* Recent Users Table */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ 
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2
            }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Recent Users
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Search sx={{ mr: 1, color: "#d1d3e2" }} />
                <Settings sx={{ color: "#d1d3e2" }} />
              </Box>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Box sx={{ 
                          display: "inline-block",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: user.status === "Active" ? "#d4edda" : "#fff3cd",
                          color: user.status === "Active" ? "#155724" : "#856404"
                        }}>
                          {user.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <Mail fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminDashboard;