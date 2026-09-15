import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { getBreadcrumbsForPath } from '@/constants/breadcrumbs';

export function AppBreadcrumbs() {
  const location = useLocation();
  const crumbs = getBreadcrumbsForPath(location.pathname);

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 2 }}>
      {crumbs.map((crumb, index) => {
        const isCurrent = index === crumbs.length - 1;

        if (isCurrent) {
          return (
            <Typography key={`${crumb.to}-${crumb.label}`} color="text.primary" sx={{ fontWeight: 600 }}>
              {crumb.label}
            </Typography>
          );
        }

        return (
          <Link
            key={`${crumb.to}-${crumb.label}`}
            component={RouterLink}
            to={crumb.to}
            underline="hover"
            color="inherit"
          >
            {crumb.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
