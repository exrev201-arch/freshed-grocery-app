import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    MessageSquare,
    Phone,
    Mail,
    Clock,
    CheckCircle,
    AlertCircle,
    HelpCircle,
    Send
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface SupportTicket {
    id: string;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    order_id?: string;
}

const CustomerSupport: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [newTicket, setNewTicket] = useState<{
        subject: string;
        message: string;
        priority: 'low' | 'medium' | 'high';
        order_id: string;
    }>({
        subject: '',
        message: '',
        priority: 'medium',
        order_id: ''
    });
    const { user } = useAuthStore();
    const { toast } = useToast();
    const { t } = useLanguage();

    const handleSubmitTicket = async () => {
        if (!newTicket.subject.trim() || !newTicket.message.trim()) {
            toast({
                title: t('insufficientInfo'),
                description: t('pleaseFillRequiredFields'),
                variant: "destructive"
            });
            return;
        }

        // In a real app, this would submit to the backend
        const ticket: SupportTicket = {
            id: Date.now().toString(),
            subject: newTicket.subject,
            message: newTicket.message,
            priority: newTicket.priority,
            status: 'open',
            created_at: new Date().toISOString(),
            order_id: newTicket.order_id || undefined
        };

        setTickets(prev => [ticket, ...prev]);
        setNewTicket({ subject: '', message: '', priority: 'medium', order_id: '' });

        toast({
            title: t('ticketCreated'),
            description: t('ticketReceived'),
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatStatus = (status: string) => {
        switch (status) {
            case 'open': return t('ticketOpen');
            case 'in_progress': return t('ticketInProgress');
            case 'resolved': return t('ticketResolved');
            default: return status;
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high': return t('priorityHigh');
            case 'medium': return t('priorityMedium');
            case 'low': return t('priorityLow');
            default: return priority;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg bg-green-600 text-white hover:bg-green-700 z-50"
                >
                    <HelpCircle className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>{t('customerSupport')}</span>
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="contact" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="contact">{t('contactUs')}</TabsTrigger>
                        <TabsTrigger value="tickets">{t('myTickets')}</TabsTrigger>
                        <TabsTrigger value="faq">{t('faq')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="contact" className="space-y-6">
                        {/* Quick Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <h3 className="font-semibold">{t('callUs')}</h3>
                                    <p className="text-sm text-muted-foreground">+255 123 456 789</p>
                                    <p className="text-xs text-muted-foreground">{t('available247')}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4 text-center">
                                    <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <h3 className="font-semibold">Email</h3>
                                    <p className="text-sm text-muted-foreground">support@fresh.co.tz</p>
                                    <p className="text-xs text-muted-foreground">{t('responseWithin2Hours')}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4 text-center">
                                    <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <h3 className="font-semibold">{t('workingHours')}</h3>
                                    <p className="text-sm text-muted-foreground">{t('morningToEvening')}</p>
                                    <p className="text-xs text-muted-foreground">{t('everyday')}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Create Support Ticket */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('createSupportTicket')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="priority">{t('priority')}</Label>
                                        <select
                                            id="priority"
                                            value={newTicket.priority}
                                            onChange={(e) => setNewTicket(prev => ({
                                                ...prev,
                                                priority: e.target.value as 'low' | 'medium' | 'high'
                                            }))}
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="low">{t('priorityLow')}</option>
                                            <option value="medium">{t('priorityMedium')}</option>
                                            <option value="high">{t('priorityHigh')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="order_id">{t('orderNumberOptional')}</Label>
                                        <Input
                                            id="order_id"
                                            value={newTicket.order_id}
                                            onChange={(e) => setNewTicket(prev => ({ ...prev, order_id: e.target.value }))}
                                            placeholder={t('ifOrderIssue')}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="subject">{t('issueSubject')}</Label>
                                    <Input
                                        id="subject"
                                        value={newTicket.subject}
                                        onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                                        placeholder={t('brieflyDescribeIssue')}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="message">{t('detailedDescription')}</Label>
                                    <Textarea
                                        id="message"
                                        value={newTicket.message}
                                        onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                                        placeholder={t('describeIssueInDetail')}
                                        rows={4}
                                        required
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmitTicket}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    {t('sendTicket')}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tickets" className="space-y-4">
                        {tickets.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>{t('noSupportTickets')}</p>
                                    <p className="text-sm">{t('yourSupportTicketsWillAppearHere')}</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {tickets.map((ticket) => (
                                    <Card key={ticket.id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                                                <div className="flex space-x-2">
                                                    <Badge className={getPriorityColor(ticket.priority)}>
                                                        {getPriorityLabel(ticket.priority)}
                                                    </Badge>
                                                    <Badge className={getStatusColor(ticket.status)}>
                                                        {formatStatus(ticket.status)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {ticket.message}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{t('created')}: {new Date(ticket.created_at).toLocaleString('sw-TZ')}</span>
                                                {ticket.order_id && (
                                                    <span>{t('order')}: #{ticket.order_id.slice(-8)}</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="faq" className="space-y-4">
                        <div className="space-y-4">
                            {[
                                {
                                    question: t('faq1Question'),
                                    answer: t('faq1Answer')
                                },
                                {
                                    question: t('faq2Question'),
                                    answer: t('faq2Answer')
                                },
                                {
                                    question: t('faq3Question'),
                                    answer: t('faq3Answer')
                                },
                                {
                                    question: t('faq4Question'),
                                    answer: t('faq4Answer')
                                },
                                {
                                    question: t('faq5Question'),
                                    answer: t('faq5Answer')
                                }
                            ].map((faq, index) => (
                                <Card key={index}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start space-x-3">
                                            <HelpCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h3 className="font-semibold text-sm mb-2">{faq.question}</h3>
                                                <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerSupport;