import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";

const ProjectList = ({
  projects = [],
  selectedProject,
  onSelectProject,
  onEditProject,
  onDeleteProject,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const [activeProjectId, setActiveProjectId] = React.useState(null);
  const open = Boolean(menuAnchorEl);

  // Handle menu open
  const handleMenuClick = (event, projectId) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActiveProjectId(projectId);
  };

  // Handle menu close
  const handleMenuClose = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(null);
  };

  // Handle edit click
  const handleEditClick = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(null);
    if (onEditProject) {
      const project = projects.find((p) => p.id === activeProjectId);
      onEditProject(project);
    }
  };

  // Handle delete click
  const handleDeleteClick = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(null);
    if (onDeleteProject) {
      onDeleteProject(activeProjectId);
    }
  };

  return (
    <List sx={{ overflow: "auto", maxHeight: "calc(100vh - 300px)" }}>
      {projects.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ p: 2, textAlign: "center" }}
        >
          No projects available
        </Typography>
      ) : (
        projects.map((project) => (
          <React.Fragment key={project.id}>
            <ListItem
              disablePadding
              secondaryAction={
                (onEditProject || onDeleteProject) && (
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleMenuClick(e, project.id)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )
              }
            >
              <ListItemButton
                selected={selectedProject && selectedProject.id === project.id}
                onClick={() => onSelectProject(project)}
                sx={{ borderRadius: 1 }}
              >
                <FolderIcon sx={{ mr: 2, color: "primary.main" }} />
                <ListItemText
                  primary={project.name}
                  secondary={`${
                    project.description
                      ? project.description.substring(0, 30)
                      : ""
                  }${
                    project.description && project.description.length > 30
                      ? "..."
                      : ""
                  }`}
                />
              </ListItemButton>
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))
      )}

      {/* Project Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        {onEditProject && (
          <MenuItem onClick={handleEditClick}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        {onDeleteProject && (
          <MenuItem onClick={handleDeleteClick}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </List>
  );
};

export default ProjectList;
