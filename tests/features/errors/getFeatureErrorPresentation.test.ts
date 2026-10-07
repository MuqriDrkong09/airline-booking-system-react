import { getFeatureErrorPresentation } from '@/features/errors';
import { ApiError, HTTP_STATUS_MESSAGES } from '@/services/api';
import { APP_ROUTES } from '@/constants/routes';

describe('getFeatureErrorPresentation', () => {
  it('maps 401 and 403 to navigation targets', () => {
    expect(
      getFeatureErrorPresentation(
        new ApiError('Request failed with status code 401', { status: 401 }),
      ),
    ).toMatchObject({
      message: HTTP_STATUS_MESSAGES[401],
      navigateTo: APP_ROUTES.public.unauthorized,
    });
    expect(getFeatureErrorPresentation(new ApiError('denied', { status: 403 }))).toMatchObject({
      navigateTo: APP_ROUTES.public.forbidden,
    });
  });

  it('keeps safe backend messages for other statuses', () => {
    const presentation = getFeatureErrorPresentation(
      new ApiError('Promo code expired.', { status: 400 }),
    );
    expect(presentation.message).toBe('Promo code expired.');
    expect(presentation.navigateTo).toBeUndefined();
  });
});
