import { AppState } from "@/contexts/AppStateContext";
import { useTranslation } from 'react-i18next';

interface LoadingScreenProps {
  state: AppState;
}

export default function LoadingScreen({ state }: LoadingScreenProps) {
  const { t } = useTranslation('states');

  const getLoadingMessage = (state: AppState): string => {
    switch (state) {
      case AppState.INITIALIZING:
        return t('loading.initializing');
      case AppState.LOADING:
        return t('loading.loading');
      default:
        return t('loading.loading');
    }
  };

  const getLoadingSubtitle = (state: AppState): string => {
    switch (state) {
      case AppState.INITIALIZING:
        return t('loading.subtitle.initializing');
      case AppState.LOADING:
        return t('loading.subtitle.loading');
      default:
        return t('loading.subtitle.default');
    }
  };

  return (
    <div class="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div class="text-center space-y-6">
        {/* Logo/Icon */}
        <div class="flex justify-center">
          <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span class="text-2xl text-primary-foreground">🏪</span>
          </div>
        </div>

        {/* Loading Animation */}
        <div class="space-y-4">
          <div class="flex justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>

          {/* Loading Message */}
          <div class="space-y-2">
            <h2 class="text-xl font-semibold text-foreground">
              {getLoadingMessage(state)}
            </h2>
            <p class="text-muted-foreground">
              {getLoadingSubtitle(state)}
            </p>
          </div>
        </div>

        {/* Progress Dots */}
        <div class="flex justify-center space-x-2">
          <div class="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div class="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
          <div class="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
} 
